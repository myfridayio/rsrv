import * as React from "react"
import { View, Text, Image, SafeAreaView, Share, TouchableOpacity, Platform } from "react-native"
import { Button } from "../views"
import Spotify, { AuthState } from '../lib/spotify'
import { Artist, Playlist, Track } from '../lib/spotify/types'
import { Props } from '../lib/react/types'
import _, { create } from 'underscore'
import LinearGradient from 'react-native-linear-gradient'
import { Svg, Defs, Path, Text as SvgText, TextPath } from "react-native-svg"
import Wallet from "../Wallet"
import Biometrics from 'react-native-biometrics'
import { getHandle, saveHandle, getFollows } from "../lib/twitter"
import DialogInput from 'react-native-dialog-input'
import IncodeSdk from 'react-native-incode-sdk';
import {PlaidLink, LinkExit, LinkSuccess } from 'react-native-plaid-link-sdk';

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  
  return (h2>>>0).toString(16).padStart(8,'0')+(h1>>>0).toString(16).padStart(8,'0')
}

const hashString = cyrb53

enum ViewState {
  Splash,
  KYC,
  Prompt,
  Scoring,
  Scored,
}

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [viewState, setViewState] = React.useState<ViewState>(ViewState.Splash)

  const [dataSyncDone, setDataSyncDone] = React.useState(false)
  const [isGettingTwitterHandle, setGettingTwitterHandle] = React.useState(false)
  const [isCreatingWallet, setCreatingWallet] = React.useState(false)
  const [walletPublicKey, setWalletPublicKey] = React.useState('')

  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)

  const [linkToken, setLinkToken] = React.useState<string>();

  const loadWallet = async () => {
    const wallet = (await Wallet.shared()) || (await Wallet.create())!
    setWalletPublicKey(wallet.publicKeyString)
  }

  const createLinkToken = React.useCallback(async () => {
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
      console.log(err);
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
      //console.log('Sandeep - balance data - '+JSON.stringify(data))
    })
    .catch((err) => {
      console.log(err);
    });
  }, []);

  const getTransactions = React.useCallback(async () => {
    await fetch(`https://app.rsrv.credit/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((data) => {
      console.log('Sandeep - transaction data - '+JSON.stringify(data))
    })
    .catch((err) => {
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
        // 2. configure and start onboarding
        IncodeSdk.showCloseButton(true);
        startOnboarding();
      })
      .catch(e => console.error('Incode SDK failed init', e));
  };

  const startOnboarding = () =>
    IncodeSdk.startOnboarding({
      flowConfig: [
        {module: 'IdScan'},
      ],
    })
      .then(result => {
        console.log(result);
        if(result.status === 'success')
          setViewState(ViewState.Prompt)
      })
      .catch(error => console.log(error));

  const createWallet = async () => {
    if (await Wallet.shared()) {
      setViewState(ViewState.KYC)
      createLinkToken()
      return
    }

    setCreatingWallet(true)
    Wallet.create().then(() => {
      setViewState(ViewState.KYC)
      createLinkToken()
    })
  }

  const SplashScene = () => {
    return (
      <>
        <Text style={{ fontSize: 60, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase" }}>Prove Your Credit</Text>
        <Text style={{ fontSize: 18, color: 'white', width: 210, textAlign: 'center', lineHeight: 28}}>Create your wallet. Connect your bank account with Plaid, and see your score.</Text>
        <Button onPress={createWallet} medium backgroundColor="white" textColor="#626567" textStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }} style={{ width: 200, marginBottom: 50, opacity: isCreatingWallet ? 0.7 : 1.0  }} disabled={isCreatingWallet}>Create Wallet</Button>
      </>
    )
  }

  const KYCScene = () => {
    return (
      <>
        <Text style={{ marginTop: 40, fontSize: 60, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase" }}>VERIFY YOURSELF</Text>
        <Text style={{ fontSize: 16, color: 'white', width: 300, textAlign: 'center', lineHeight: 20}}>Verify yourself with a valid id or passport.</Text>
        <Button onPress={initializeAndRunOnboarding} medium backgroundColor="white" textColor="#626567" textStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }} style={{ width: 200, marginBottom: 50, marginTop: 14 }}>VERIFY YOURSELF</Button>
      </>
    )
  }

  const PromptScene = () => {
    return (
      <>
        <Text style={{ marginTop: 40, fontSize: 60, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase" }}>CONNECT VIA PLAID</Text>
        <Text style={{ fontSize: 16, color: 'white', width: 300, textAlign: 'center', lineHeight: 20}}>Connect your bank account securely via Plaid.</Text>
        <PlaidLink
          tokenConfig={{
            token: linkToken!,
            noLoadingState: false,
          }}
          onSuccess={async (success: LinkSuccess) => {
            await fetch(`https://app.rsrv.credit/api/exchange_public_token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ public_token: success.publicToken }),
            })
            .catch((err) => {
              console.log(err);
            });
            //console.log(success);
            //navigation.navigate('Success', success);
            //getBalance()
            getTransactions()
          }}
          onExit={(response: LinkExit) => {
            //console.log(response);
          }}>
          <View style={{width: 200, marginBottom: 50, marginTop: 14, backgroundColor: 'white', paddingVertical: 4, paddingHorizontal: 16, borderRadius: 15, height: 30, alignItems: 'center', justifyContent: 'center'}}>
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

         <TouchableOpacity onPress={() => navigation.navigate('NFTs')}>
          <Text style={{ fontSize: 14, color: '#5244DF', width: 200, marginTop: 20, textAlign: 'center', textDecorationLine: 'underline'}}>Check your NFTs</Text>
        </TouchableOpacity>
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
      <SafeAreaView>
        <View style={{ position: 'absolute', top: 60, left: 30}}>
            <Image style={{height: 100, width: 100}} source={require('../images/RSRV_logo_white.png')} />
        </View>
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '95%', width: '100%' }}>
          <View style={{ height: 120, width: '100%', flexDirection: 'column', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, paddingVertical: 20 }}>
              {viewState === ViewState.Prompt ?
              <Button onPress={() => navigation.navigate('NFTs')} medium backgroundColor="white" textColor="#550451" textStyle={{ fontWeight: 'normal' }} style={{ opacity: 0.4, width: 100 }}>NFTs</Button>
              :
              <View></View>
              }
              <View></View>
            </View>
          </View>
          <View style={{ flexGrow: 1, paddingHorizontal: 30, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
            {centerContent()}
          </View>
        </View>
        <View style={{ height: 50, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 20 }}>
            <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Flilfri.png?alt=media&token=06015a13-4396-459c-88e8-3900d2b2916c' }} style={{ width: 20, height: 20, marginLeft: 20 }}/>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = {
  musicUnitesUs: {
    fontSize: 24,
    color: '#B0AAFF',
    fontFamily: "RubikMonoOne-Regular",
    textShadowColor: 'rgba(176, 170, 255, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },

  smallText: {
    fontSize: 16
  },

  mediumText: {
    fontSize: 20
  },

  largeText: {
    fontSize: 24
  },
}

export default Connect