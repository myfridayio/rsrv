import * as React from "react"
import { View, Text, Image, SafeAreaView, StyleProp, Dimensions, TextStyle, ViewStyle } from "react-native"

import { Button } from "../views"
import { Props } from '../lib/react/types'
import LinearGradient from 'react-native-linear-gradient'
import Wallet from "../Wallet"
import IncodeSdk from 'react-native-incode-sdk'
import { PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk'
import { Style } from "../lib/ui"
import Toast from 'react-native-toast-message';
import { ScoringResponse } from "../lib/types/Scores"
import { range } from "underscore"

enum ViewState {
  Splash,
  KYC,
  Prompt,
  Scoring,
  Scored,
}

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [viewState, setViewState] = React.useState<ViewState>(ViewState.Splash)

  const [isCreatingWallet, setCreatingWallet] = React.useState(false)
  const [walletPublicKey, setWalletPublicKey] = React.useState('')
  const [score, setScore] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)

  const [linkToken, setLinkToken] = React.useState<string>();
  var walletKey: String

  const screen = Dimensions.get('screen')

  const loadWallet = async () => {
    const wallet = (await Wallet.shared()) || (await Wallet.create())!
    setWalletPublicKey(wallet.publicKeyString)
    walletKey = wallet.publicKeyString
  }

  const createLinkToken = React.useCallback(async () => {
    console.log('createLinkToken.fetch...')
    await fetch(`https://app.rsrv.credit/api/create_link_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('data - '+JSON.stringify(data))
      setLinkToken(data.link_token);
    })
    .catch((err) => {
      console.log('createLinkToken.fetch fail')
      console.error(err);
    });
  }, [setLinkToken])

  const getBalance = React.useCallback(async () => {
    await fetch(`https://app.rsrv.credit/api/balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      //console.log('balance data - '+JSON.stringify(data))
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);

  const getTransactions = React.useCallback(async () => {
    await fetch(`https://app.rsrv.credit/api/transactions`)
    .then((response) => response.json())
    .then((data) => {
      getScore(walletKey, data)
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);

  const getScore = React.useCallback(async (address: String, transactions: any) => {
    console.log('wallet address - '+address)
    await fetch(`https://app.rsrv.credit/api/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: address,
        transactions
      }),
    })
    .then((response) => response.json())
    .then((data: ScoringResponse) => {
      console.log(data)
      setIsLoading(false)
      navigation.navigate('Score', { response: data })
    })
    .catch((err) => {
      setIsLoading(false)
      Toast.show({
        type: 'error',
        text1: 'Something went wrong.',
        text2: 'Please try again!'
      });
      createLinkToken()
      console.log(err);
    });
  }, []);

  React.useEffect(() => {
    loadWallet()
  }, [])

  const initializeAndRunOnboarding = () => {
    IncodeSdk.initialize({
      testMode: false,
      apiConfig: {
        key: '50d4d4c1cb6fa0a1d64dd1951bb0270892e1dd3c',
        url: 'https://demo-api.incodesmile.com/',
      },
    })
      .then(_ => {
        IncodeSdk.showCloseButton(true);
        startOnboarding();
      })
      .catch(e => { console.log('initializeAndRunOnboarding/error'); console.error(e) });
  };

  const startOnboarding = () =>
    IncodeSdk.startOnboarding({ flowConfig: [{ module: 'IdScan' }] })
      .then(result => {
        console.log('startOnboarding/result<OnboardingResponse>', result)
        if (result.status === 'success') {
          setViewState(ViewState.Prompt)
        }
      })
      .catch(error => { console.log('startOnboarding/error'); console.error(error) })

  const createWallet = async () => {
    var wallet
    if (!await Wallet.shared()) {
      wallet = await Wallet.create()
    }
    wallet = await Wallet.shared()
    setWalletPublicKey(wallet!.publicKeyString)
    walletKey = wallet!.publicKeyString
    setViewState(ViewState.KYC)
    createLinkToken()
  }


  const SplashScene = () => {
    const textStyle: StyleProp<TextStyle> = {
      fontSize: 24,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
      color: 'white',
      lineHeight: 32
    }
    const Step = ({ n, children: text }: { n: number, children: React.ReactNode }) => {
      const is = new Array(n).fill('i').join('')
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 36, marginRight: 5 }}>
            <Text style={[textStyle, { textAlign: 'right' }]}>{is}.</Text>
          </View>
          <Text style={[textStyle, { letterSpacing: -1}]}>{text}</Text>
        </View>
      )
      // <Text style={textStyle}><Text style={[numStyle]}>i.</Text><Text>GET YOUR DATA</Text></Text>
    }
    return (
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
        <View style={{ flexDirection: 'column', justifyContent: 'flex-end', flex: 2, marginBottom: 200 }}>
          <Step n={1}><Text>GET YOUR DATA</Text></Step>
          <Step n={2}><Text>GET YOUR SCORE</Text></Step>
          <Step n={3}><Text>GET THE CREDIT YOU <Text style={{ color: '#2acec6' }}>RSRV</Text></Text></Step>
        </View>
        <Button onPress={createWallet} large backgroundColor="white" textColor="#626567" style={{ width: 200, marginBottom: 50, opacity: isCreatingWallet ? 0.7 : 1.0  }} disabled={isCreatingWallet}>Create Wallet</Button>
      </View>
    )
  }

  const KYCScene = () => {
    return (
      <>
        <Text style={{ marginTop: 40, fontSize: 60, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase", fontFamily: 'Helvetica' }}>VERIFY YOURSELF</Text>
        <Text style={{ fontSize: 16, fontFamily: 'Helvetica', color: 'white', width: 300, textAlign: 'center', lineHeight: 20}}>Verify yourself with a valid id or passport.</Text>
        <Button onPress={initializeAndRunOnboarding} large backgroundColor="white" textColor="#626567" style={{ width: 200, marginBottom: 50, marginTop: 175 }}>VERIFY YOURSELF</Button>
      </>
    )
  }

  const PromptScene = () => {

    const largeButtonStyle: StyleProp<ViewStyle> = {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 8,
      paddingHorizontal: 25,
      borderRadius: 22,
      height: 44, width: 200,
      marginBottom: 50, marginTop: 150,
    }
    return (
      <>
        <Text style={{ marginTop: 40, fontSize: 60, lineHeight: 62, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase", fontFamily: 'Helvetica' }}>CONNECT VIA PLAID</Text>
        <Text style={{ fontSize: 16, color: 'white', width: 300, textAlign: 'center', lineHeight: 20, fontFamily: 'Helvetica'}}>Connect your bank account securely via Plaid.</Text>
        <PlaidLink
          tokenConfig={{
            token: linkToken!,
            noLoadingState: false,
          }}
          onSuccess={async (success: LinkSuccess) => {
            setIsLoading(true)
            await fetch(`https://app.rsrv.credit/api/exchange_public_token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ public_token: success.publicToken }),
            })
            .catch((err) => {
              console.log('PlaidLink.onSuccess/error')
              console.error(err);
            });
            getTransactions()
          }}
          onExit={(response: LinkExit) => {
            console.log('PlaidLink.onExit', response)
          }}>
          <View style={[largeButtonStyle]}>
            <Text style={{color: "#626567", fontWeight: 'bold', textTransform: 'uppercase'}}>CONNECT</Text>
          </View>
        </PlaidLink>
      </>
    )
  }

  const WaitingScene = () => {

    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', width: '100%', }}>
        <Text style={{ color: 'white', fontWeight: '500', fontSize: 18, marginBottom: 18 }}></Text>
      </View>
    )
  }

  const ScoreScene = () => {
    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', width: '100%', }}>
        <Text style={{ fontSize: 40, fontWeight: '600', color: 'white', textTransform: 'uppercase' }}>You Scored!</Text>
        <Text style={{ fontSize: 130, fontWeight: '800', color: 'white' }}>{score}</Text>
      </View>
    )
  }

  const centerContent = () => {
    switch (viewState) {
      case ViewState.Splash: return <SplashScene/>
      case ViewState.KYC: return <KYCScene/>
      case ViewState.Prompt: return <PromptScene/>
      case ViewState.Scoring: return <WaitingScene/>
      case ViewState.Scored: return <ScoreScene/>
      default: return null
    }
  }

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
      locations={[ 0.0, 0.3, 0.65, 1.0 ]}
      colors={['#05D3D1', '#00B6C3', '#004C91', '#001840']}
      style={{ height: '100%', width: '100%' }}>
      <View style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
          <Image style={{ height: 100, width: 100, position: 'absolute', top: 60, left: 30 }} source={require('../images/RSRV_logo_white.png')} />
          <View style={[Style.column, Style.justifyEnd, Style.alignCenter, Style.ph24, { width: '100%', flex: 1, marginTop: '30%', marginBottom: 50 }]}>
            {centerContent()}
            <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Flilfri.png?alt=media&token=06015a13-4396-459c-88e8-3900d2b2916c' }} style={{ width: 20, height: 20 }}/>
          </View>
        </SafeAreaView>
        {
          isLoading && 
          <View style={{position: 'absolute', height: '100%', width: '100%', backgroundColor: "#00000099", alignItems: 'center', justifyContent: 'center'}}>
            <Image style={{width: 150, height: 150}} source={{uri: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDY5aWV6bmx2d21hOXVramg5cGt0bDJ0NTY2M2JueHl1dnhuejV4OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PkoBC2GlkLJ5yFIWtf/giphy.gif'}}/>
          </View>
        }
      </View>
    </LinearGradient>
  )
}

export default Connect