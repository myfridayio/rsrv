import * as React from "react"
import { View, Text, Image, SafeAreaView } from "react-native"
import { Button } from "../views"
import Spotify, { AuthState } from '../lib/spotify'
import { Artist, Playlist, Track } from '../lib/spotify/types'
import { Props } from '../lib/react/types'
import _ from 'underscore'
import LinearGradient from 'react-native-linear-gradient'
import { Svg, Defs, Path, Text as SvgText, TextPath } from "react-native-svg"

type ArtistConfig = {
  name: string,
  display: boolean,
  displayName?: string,
  image?: any,
}

const ARTISTS: ArtistConfig[] = [
  {
    name: "Robby Krieger",
    displayName: "Robby Krieger of The Doors",
    display: true,
    image: require('../images/robby_nft.png'),
  },
  {
    name: "Talib Kweli",
    display: true,
    image: require('../images/kweli_nft.png'),
  },
  {
    name: "Tribe Friday",
    display: true,
    image: require('../images/tribefriday_nft.png'),
  },
  {
    name: "The Doors",
    display: false,
  },
  {
    name: "Bartees Strange",
    display: true,
    image: require('../images/bartees_nft.png'),
  },
  {
    name: "Revenge Wife",
    display: true,
    image: require('../images/revengewife_nft.png'),
  },
  {
    name: "Christian Crosby",
    display: true,
    image: require('../images/crosby_nft.png'),
  }
]

const DISPLAY_ARTISTS = ARTISTS.filter(a => a.display)

const ARTIST_NAMES = new Set<string>(ARTISTS.map(a => a.name))

enum ViewState {
  Default,
  Authenticating,
  Scoring,
  Scored,
}


const ArtistImage = ({ source }: { source: any }) => {
  return (
    <View style={{ borderRadius: 131, width: 262, height: 262, overflow: 'hidden' }}>
      <Image source={source} style={{ width: 360, height: 360, marginLeft: -49, marginRight: -49, marginTop: -69, marginBottom: -29 }} />
    </View>
  )
}

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [viewState, setViewState] = React.useState<ViewState>(ViewState.Default)

  const [followedArtists, setFollowedArtists] = React.useState<Artist[]>([])
  const [topArtists, setTopArtists] = React.useState<Artist[]>([])
  const [topTracks, setTopTracks] = React.useState<Track[]>([])
  const [recentTracks, setRecentTracks] = React.useState<Track[]>([])
  const [myTracks, setMyTracks] = React.useState<Track[]>([])
  const [playlistTracks, setPlaylistTracks] = React.useState<Track[]>([])
  const [matchedArtists, setMatchedArtists] = React.useState<Artist[]>([])

  const [dataSyncDone, setDataSyncDone] = React.useState(false)

  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)
  const [displayingArtist, setDisplayingArtist] = React.useState(_.sample(DISPLAY_ARTISTS, 1)[0])

  React.useEffect(() => {
    setAuthState(Spotify.shared().authState)
    return Spotify.shared().onAuthStateChange(({ after }) => { setAuthState(after)})
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
        Spotify.shared().getPlaylists().then(ps => Promise.all(ps.map(p => Spotify.shared().getTracksForPlaylist(p.id))))
        .then(playlistTracks => {
          const trackIds = new Set<string>()
          const dedupedTracks: Track[] = []
          playlistTracks.forEach(tracks => {
            tracks.forEach(track => {
              if (!track || !track.id) return
              if (!trackIds.has(track.id)) {
                trackIds.add(track.id)
                dedupedTracks.push(track)
              }
            })
          })
          console.log('from playlists got', dedupedTracks.length, 'unique tracks')
          setPlaylistTracks(dedupedTracks)
        })
      ])
      .then(() => {
        setDataSyncDone(true)
      })
      .then(() => {
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
    const myTrackCount = myTrackArtistMatches.length

    const playlistTrackMatches = playlistTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name)))
    const playlistArtistMatches = _.uniq(tracksToArtists(playlistTrackMatches), false, getArtistIdentifier)

    const topArtistsMatched = _.uniq(topArtistMatches.concat(topTrackArtistMatches), false, getArtistIdentifier)
    const topCount = topArtistMatches.length

    const savedArtistsMatched = _.uniq(myTrackArtistMatches.concat(playlistArtistMatches), false, getArtistIdentifier)
    const savedCount = savedArtistsMatched.length

    const TOP_PTS = 50
    const FOLLOWED_PTS = 10
    const RECENT_PTS = 5
    const SAVED_PTS = 1

    const savedScore = savedCount * SAVED_PTS
    const recentScore = recentMatchCount * RECENT_PTS
    const followedScore = followedArtistCount * FOLLOWED_PTS
    const topScore = topCount * TOP_PTS

    const score = savedScore + recentScore + followedScore + topScore
    console.log('saved', savedScore, '+ recent', recentScore, '+ followed', followedScore, '+ top', topScore, '=', score)

    const allMatched = recentArtistMatches.concat(followedMatches).concat(topArtistsMatched).concat(savedArtistsMatched)
    const dedupedMatched = _.uniq(allMatched, false, getArtistIdentifier)
    console.log('have', allMatched.length, 'deduped to', dedupedMatched.length, 'matches')

    setMatchedArtists(dedupedMatched)
    setScore(score)
  }, [dataSyncDone])

  const authenticate = () => {
    if (authState !== AuthState.AUTHENTICATED) {
      setViewState(ViewState.Authenticating)
      console.log('authenticating')
      Spotify.shared().askUserToAuthenticate()
    } else {
      console.log('already authenticated')
    }
  }

  const share = () => {

  }

  const StartScene = () => {
    return (
      <>
        <Text style={{ marginTop: 50, fontSize: 80, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase" }}>Are you a true fan?</Text>
        <Button onPress={authenticate} medium backgroundColor="white" textColor="#FF5CB8" textStyle={{ fontWeight: 'normal' }} style={{ width: 200, marginBottom: 50 }}>CHECK SPOTIFY</Button>
      </>
    )
  }

  const WaitingScene = () => {
    React.useEffect(() => {
      const interval = setInterval(() => {
        setDisplayingArtist(_.sample(DISPLAY_ARTISTS, 1)[0])
      }, 2000)
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
        <Text style={{ fontSize: 150, fontWeight: '800', color: 'white' }}>{score}</Text>
        <Text style={{ fontSize: 16, color: 'white', width: 200, textAlign: 'center', lineHeight: 28}}>You are a fan of {matchedArtists.length} artist{matchedArtists.length === 1 ? '' : 's'} in the line up tonight!</Text>
        <Text style={{ fontSize: 14, color: '#5244DF', width: 200, marginVertical: 20, textAlign: 'center'}}>{matchedArtists.map(a => a.name).join(' / ')}</Text>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '500', marginTop: 20 }}>SCORING:</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>In a Playlist - 1 pt</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>Recently Played - 5 pt</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>Following - 10 pt</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>Top Artist - 50 pt</Text>
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
      case ViewState.Default: 
      case ViewState.Authenticating:
        return <StartScene/>
      case ViewState.Scoring:
        return <WaitingScene/>
      case ViewState.Scored:
        return <ScoreScene/>
      default:
        return null
    }
  }

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
      locations={[ 0.0, 0.3, 0.65, 1.0 ]}
      colors={['#5504F1', '#FF48C0', '#FF88BB', '#FF2D1D']}
      style={{ height: '100%', width: '100%' }}>
      <SafeAreaView style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%', width: '100%' }}>

        <View style={{ height: 120, width: '100%', flexDirection: 'column', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', paddingRight: 20, paddingVertical: 20 }}>
            <Button onPress={share} medium backgroundColor="white" textColor="#550451" textStyle={{ fontWeight: 'normal' }} style={{ opacity: 0.4, width: 100 }}>SHARE</Button>
          </View>
          <Text style={styles.musicUnitesUs}>MUSIC UNITES US!</Text>
        </View>
        <View style={{ flexGrow: 1, paddingHorizontal: 30, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
          {centerContent()}
        </View>

        <View style={{ height: 75, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../images/afa_logo.png')} style={{ width: 35, height: 20, marginLeft: 20 }}/>
          <Image source={require('../images/give-a-note.png')} style={{ width: 35, height: 20, marginLeft: 20 }}/>
          <Image source={require('../images/lilfri.png')} style={{ width: 20, height: 20, marginLeft: 20 }}/>
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