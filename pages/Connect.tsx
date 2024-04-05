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

type ArtistConfig = {
  name: string,
  display: boolean,
  displayName?: string,
  image?: any,
}


const IMAGES = {
  afa: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Fafa_logo.png?alt=media&token=b869ae10-ca6f-42df-b07e-a67065e3a3d3',
  giveanote: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Fgive-a-note.png?alt=media&token=ac7b52ee-3846-4b37-9764-49076da74589',
  blackfriday: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Flilfri.png?alt=media&token=06015a13-4396-459c-88e8-3900d2b2916c',

  bartees: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Fbartees_nft.png?alt=media&token=5586b942-1290-4958-bd56-ec27190debbb',
  crosby: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Fcrosby_nft.png?alt=media&token=e1f6bded-e949-4884-8eed-592137a387b7',
  kweli: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Fkweli_nft.png?alt=media&token=dd7fefe0-025c-49da-a0fb-ba64fb89a3a4',
  revenge: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Frevengewife_nft.png?alt=media&token=06cd8d8c-1bed-47e7-a51b-e64c3c186502',
  robby: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Frobby_nft.png?alt=media&token=3ebaec5e-641d-4811-90d1-c4473b801d96',
  tribe: 'https://firebasestorage.googleapis.com/v0/b/friday-8bf41.appspot.com/o/images%2Ftribefriday_nft.png?alt=media&token=8dbe2967-7fd3-4f3e-b810-078f5cb13eb2'
}

Object.values(IMAGES).forEach(uri => Image.prefetch(uri))

const ARTISTS: ArtistConfig[] = [
  {
    name: "Robby Krieger",
    displayName: "Robby Krieger of The Doors",
    display: true,
    image: IMAGES.robby,
  },
  {
    name: "Talib Kweli",
    display: true,
    image: IMAGES.kweli,
  },
  {
    name: "Tribe Friday",
    display: true,
    image: IMAGES.tribe,
  },
  {
    name: "The Doors",
    display: false,
  },
  {
    name: "Bartees Strange",
    display: true,
    image: IMAGES.bartees,
  },
  {
    name: "Revenge Wife",
    display: true,
    image: IMAGES.revenge,
  },
  {
    name: "Christian Crosby",
    display: true,
    image: IMAGES.crosby,
  }
]

const DISPLAY_ARTISTS = ARTISTS.filter(a => a.display)

const ARTIST_NAMES = new Set<string>(ARTISTS.map(a => a.name))

const TWITTERS = [
  'RobbyKrieger', 'TheDoors', 'TalibKweli', 'blackstarmusic', 'bartees_strange', 'TribeFriday', 'RevengeWife', 'ChristianCrosb',
  'sxsw', 'AFAmgmt', 'GiveANote', 'netflix', 'unclenearest', 'AmerSongwriter', 'Duravo_Luggage', 'BoozyBites', 'gibsonguitar', 'Fender', 'AlvarezGuitar', 'BlackstarAmps', 'casalumbre_', 'VidlLife'
]

enum ViewState {
  Splash,
  KYC,
  Prompt,
  Scoring,
  Scored,
}


const ArtistImage = ({ source }: { source: string }) => {
  return (
    <View style={{ borderRadius: 131, width: 262, height: 262, overflow: 'hidden' }}>
      <Image source={{ uri: source }} style={{ width: 360, height: 360, marginLeft: -49, marginRight: -49, marginTop: -69, marginBottom: -29 }} />
    </View>
  )
}

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [viewState, setViewState] = React.useState<ViewState>(ViewState.Splash)

  const [followedArtists, setFollowedArtists] = React.useState<Artist[]>([])
  const [topArtists, setTopArtists] = React.useState<Artist[]>([])
  const [topTracks, setTopTracks] = React.useState<Track[]>([])
  const [recentTracks, setRecentTracks] = React.useState<Track[]>([])
  const [myTracks, setMyTracks] = React.useState<Track[]>([])
  const [playlistTracks, setPlaylistTracks] = React.useState<Track[]>([])
  const [matchedArtists, setMatchedArtists] = React.useState<Artist[]>([])

  const [dataSyncDone, setDataSyncDone] = React.useState(false)
  const [isGettingTwitterHandle, setGettingTwitterHandle] = React.useState(false)
  const [twitterHandle, setTwitterHandle] = React.useState<string>()
  const [twitterFollows, setTwitterFollows] = React.useState<string[]>([])
  const [isCreatingWallet, setCreatingWallet] = React.useState(false)
  const [walletPublicKey, setWalletPublicKey] = React.useState('')

  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)
  const [displayingArtist, setDisplayingArtist] = React.useState(_.sample(DISPLAY_ARTISTS, 1)[0])

  const [linkToken, setLinkToken] = React.useState(null);

  const simplifyArtist = (artist: Artist) => {
    return { name: artist.name, id: artist.id, uri: artist.uri }
  }

  const simplifyTrack = (track: Track) => {
    return { id: track.id, name: track.name, uri: track.uri }
  }

  let savedHash: string
  const saveData = () => {
    if (!walletPublicKey) {
      console.log('no wallet')
      return
    }

    const data = {
      _id: walletPublicKey,
      score,
      twitterHandle,
      twitterFollows,
      followedArtists: followedArtists.map(simplifyArtist),
      topArtists: topArtists.map(simplifyArtist),
      topTracks: topTracks.map(simplifyTrack),
      recentTracks: recentTracks.map(simplifyTrack),
      matchedArtists: matchedArtists.map(simplifyArtist),
      walletPublicKey,
    }
    const body = JSON.stringify(data)
    const hash = hashString(body)
    if (hash === savedHash) {
      console.log('not duplicating send')
      return
    } else {
      console.log('sending')
    }
    const url = 'https://us-central1-friday-8bf41.cloudfunctions.net/saveRecord'
    fetch(url, {
      method: 'post',
      body,
      headers: { 'Content-Type': 'application/json' }
    }).then(async response => {
      try {
        await response.json().then(j => console.log('got bck', j)).catch(e => console.error(e))
        console.log('successfully saved data')
        savedHash = hash
      } catch(e) {
        console.log('failed to parse response', response.statusText)
      }
    }).catch(e => {
      console.log('OH NOES')
      console.error(e)
    })
  }

  const loadWallet = async () => {
    const wallet = (await Wallet.shared()) || (await Wallet.create())!
    setWalletPublicKey(wallet.publicKeyString)
  }

  const createLinkToken = React.useCallback(async () => {
    await fetch(`https://friday-8bf41.web.app/api/create_link_token`, {
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
    await fetch(`https://friday-8bf41.web.app/api/balance`, {
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
    await fetch(`https://friday-8bf41.web.app/api/transactions`, {
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
    getHandle().then(handle => { if (handle) { setTwitterHandle(handle) } })

    const unFollowAuthState = Spotify.shared().onAuthStateChange(({ after }) => { setAuthState(after)})
    setAuthState(Spotify.shared().authState)
    return unFollowAuthState
  }, [])

  React.useEffect(() => {
    if (dataSyncDone) {
      console.log('done')
      return
    }
    if (authState === AuthState.AUTHENTICATED) {
      console.log('authenticated')
      setViewState(ViewState.Scoring)
      
      const showScore = () => { setViewState(ViewState.Scored) }
      let isTimeUp = false
      let isScoringComplete = false
      setTimeout(() => {
        if (isScoringComplete) {
          showScore()
        } else {
          isTimeUp = true
        }
      }, 10000)

      Promise.all([
        Spotify.shared().getRecentlyPlayedTracks().then(ts => { console.log('got', ts.length, 'recently played tracks'); setRecentTracks(ts)}),
        Spotify.shared().getFollowedArtists().then(as => { console.log('got followed artists', as.length); setFollowedArtists(as) } ),
        Spotify.shared().getTopArtists().then(as => { console.log('got top artists', as.length); setTopArtists(as) } ),
        Spotify.shared().getTopTracks().then(ts => { console.log('got top tracks', ts.length); setTopTracks(ts) } ),
        Spotify.shared().getSavedTracks().then(ts => { console.log('got saved tracks', ts.length); setMyTracks(ts) } ),
        Spotify.shared().getPlaylistTracks().then(ts => { console.log('got', ts.length, 'playlist tracks'); setPlaylistTracks(ts) } ),
      ])
      .then(() => {
        setDataSyncDone(true)
        if (isTimeUp) {
          showScore()
        } else {
          isScoringComplete = true
        }
      })
    }
  }, [authState, dataSyncDone])

  React.useEffect(() => {
    if (!dataSyncDone) return

    console.log('scoring')

    const firstArtistMatch = (track: Track) => track.artists.find(a => ARTIST_NAMES.has(a.name))
    const getArtistIdentifier = (a: Artist) => a.id || a.name
    const tracksToArtists = (tracks: Track[]) => tracks.map(firstArtistMatch) as Artist[]

    const recentTrackMatches = recentTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name)))
    const recentArtistMatches = _.uniq(tracksToArtists(recentTrackMatches), false, getArtistIdentifier)
    const recentMatchCount = recentArtistMatches.length

    const followedMatches = followedArtists.filter(a => ARTIST_NAMES.has(a.name))
    const followedArtistCount = followedMatches.length

    const topArtistMatches = topArtists.filter(a => ARTIST_NAMES.has(a.name))
    
    const topTrackMatches = topTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name)))
    const topTrackArtistMatches = _.uniq(tracksToArtists(topTrackMatches), false, getArtistIdentifier)

    const myTrackMatches = myTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name)))
    const myTrackArtistMatches = _.uniq(tracksToArtists(myTrackMatches), false, getArtistIdentifier)

    const playlistTrackMatches = playlistTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name)))
    const playlistArtistMatches = _.uniq(tracksToArtists(playlistTrackMatches), false, getArtistIdentifier)

    const topArtistsMatched = _.uniq(topArtistMatches.concat(topTrackArtistMatches), false, getArtistIdentifier)
    const topCount = topArtistMatches.length

    const savedArtistsMatched = _.uniq(myTrackArtistMatches.concat(playlistArtistMatches), false, getArtistIdentifier)
    const savedCount = savedArtistsMatched.length

    const TOP_PTS = 60
    const FOLLOWED_PTS = 10
    const RECENT_PTS = 5
    const SAVED_PTS = 1

    const savedScore = savedCount * SAVED_PTS
    const recentScore = recentMatchCount * RECENT_PTS
    const followedScore = followedArtistCount * FOLLOWED_PTS
    const topScore = topCount * TOP_PTS

    const twitterScore = _.intersection(TWITTERS.map(t => t.toLowerCase()), twitterFollows.map(t => t.toLowerCase())).length
    console.log('found', twitterScore, 'matching twitter follows of', twitterFollows.length)

    const score = savedScore + recentScore + followedScore + topScore + twitterScore
    console.log('saved', savedScore, '+ recent', recentScore, '+ followed', followedScore, '+ top', topScore, '+ twitter', twitterScore, '=', score)

    const allMatched = recentArtistMatches.concat(followedMatches).concat(topArtistsMatched).concat(savedArtistsMatched)
    const dedupedMatched = _.uniq(allMatched, false, getArtistIdentifier)
    console.log('have', allMatched.length, 'deduped to', dedupedMatched.length, 'matches')

    setMatchedArtists(dedupedMatched)
    setScore(score)
  }, [dataSyncDone, twitterFollows])

  React.useEffect(() => {
    if (recentTracks.length && walletPublicKey) {
      console.log('saving data')
      saveData()
    } else {
      console.log('not saving...', recentTracks.length, walletPublicKey)
    }
  }, [matchedArtists, walletPublicKey])

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

  const authenticate = () => {
    if (authState !== AuthState.AUTHENTICATED) {
      console.log('authenticating')
      Spotify.shared().askUserToAuthenticate()
    } else {
      console.log('already authenticated')
    }
  }

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

  const share = () => {
    Share.share({ message: 'Music Unites Us! Download now at https://www.myfriday.io/music_unites_us' })
  }

  const checkTwitter = () => {
    setGettingTwitterHandle(true)
  }

  React.useEffect(() => {
    if (twitterHandle) {
      saveHandle(twitterHandle)
      getFollows(twitterHandle).then(setTwitterFollows)
    }
  }, [twitterHandle])

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
            token: linkToken,
            noLoadingState: false,
          }}
          onSuccess={async (success: LinkSuccess) => {
            await fetch(`https://friday-8bf41.web.app/api/exchange_public_token`, {
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
    React.useEffect(() => {
      const interval = setInterval(() => {
        setDisplayingArtist(_.sample(DISPLAY_ARTISTS, 1)[0])
      }, 1000)
      return () => {
        clearInterval(interval)
      }
    }, [])

    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', width: '100%', }}>
        <Text style={{ color: 'white', fontWeight: '500', fontSize: 18, marginBottom: 18 }}>Checking Spotify</Text>
        <Image style={{ width: 50, height: 50, marginBottom: 20 }} source={require('../images/spotify_logo.png')}/>
        <ArtistImage source={displayingArtist.image}/>
        <Text style={{ color: 'white', fontWeight: '500', fontSize: 18, marginTop: 30 }}>{displayingArtist.name}...</Text>
      </View>
    )
  }

  const ScoreScene = () => {
    return (
      <View style={{ flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', width: '100%', }}>
        <Text style={{ fontSize: 40, fontWeight: '600', color: 'white', textTransform: 'uppercase' }}>You Scored!</Text>
        <Text style={{ fontSize: 130, fontWeight: '800', color: 'white' }}>{score}</Text>
        <Text style={{ fontSize: 18, color: 'white', width: 200, textAlign: 'center', lineHeight: 28}}>You are a fan of {matchedArtists.length} artist{matchedArtists.length === 1 ? '' : 's'} in the line up tonight!</Text>
        <Text style={{ fontSize: 16, color: '#5244DF', width: 200, marginVertical: 10, textAlign: 'center'}}>{matchedArtists.map(a => a.name).join(' / ')}</Text>

        {twitterHandle ?
        <Text style={{ fontSize: 16, color: 'white', width: 200, textAlign: 'center', fontStyle: 'italic' }}>Twitter connected</Text>
        :
        <>
        <Text style={{ fontSize: 16, color: 'white', width: 200, textAlign: 'center', fontStyle: 'italic', lineHeight: 20 }}>Follow the artists and sponsors on Twitter?</Text>
          <Text style={{ fontSize: 16, color: 'white', width: 200, textAlign: 'center', fontStyle: 'italic', marginBottom: 10, marginTop: 5 }}>Boost your score:</Text>
          <Button onPress={checkTwitter} small textColor="white" textStyle={{ fontSize: 10, fontWeight: 'normal' }} style={{ width: 125, borderWidth: 1, borderColor: 'white', backgroundColor: 'rgba(0,0,0,0)' }}>CHECK TWITTER</Button>
        </>
         }

         <TouchableOpacity onPress={() => navigation.navigate('NFTs')}>
        <Text style={{ fontSize: 14, color: '#5244DF', width: 200, marginTop: 20, textAlign: 'center', textDecorationLine: 'underline'}}>Check your NFTs</Text>
        </TouchableOpacity>
        <DialogInput
          isDialogVisible={isGettingTwitterHandle}
          title={"Twitter Handle"}
          hintInput={"@yourname"}
          submitInput={ (text: string) => { setTwitterHandle(text.trim()); setGettingTwitterHandle(false) } }
          closeDialog={ () => setGettingTwitterHandle(false) }
        ></DialogInput>
      </View>
    )
  }

  const textWorksButNoShadowSad = () => {
    return (
      <View style={{ width: 320, height: 40, shadowColor: 'black', shadowOffset: { width: 0, height: 0 }, shadowRadius: 10 }}>
      <Svg width='100%' height={40}>
        <Defs>
          <Path id='bigArc' d='m 0 35 a 160 18, 0, 0, 1, 320 35'/>
        </Defs>
        <SvgText x='0' fill='#A595FC' fontSize={24} fontFamily="RubikMonoOne-Regular">
          <TextPath xlinkHref="#bigArc">MUSIC UNITES US!</TextPath>
        </SvgText>
      </Svg>
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
      colors={['#020D43', '#1140A1', '#1977FF', '#020D43']}
      style={{ height: '100%', width: '100%' }}>
      <SafeAreaView>
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
            <Image source={{ uri: IMAGES.blackfriday }} style={{ width: 20, height: 20, marginLeft: 20 }}/>
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