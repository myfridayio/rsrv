import * as React from "react"
import { View, Text } from "react-native"
import { Button } from "../views"
import Spotify, { AuthState } from '../lib/spotify'
import { Artist, Playlist, Track } from '../lib/spotify/types'
import { Props } from '../lib/react/types'
import color from "../lib/ui/color"
import _ from 'underscore'
import LinearGradient from 'react-native-linear-gradient'

const ARTISTS = [
  {
    name: "Robby Krieger",
    color: "lightpink",
    displayName: "Robby Krieger of The Doors",
    display: true,
  },
  {
    name: "Talib Kweli",
    color: "lightgreen",
    display: true,
  },
  {
    name: "Tribe Friday",
    color: "lightblue",
    display: true,
  },
  {
    name: "The Doors",
    color: "lightgray",
    display: false,
  },
  {
    name: "Bartees Strange",
    color: "green",
    display: true,
  },
  {
    name: "Revenge Wife",
    color: "yellow",
    display: true,
  },
  {
    name: "Christian Crosby",
    color: "pink",
    display: true,
  }
]

const ARTIST_NAMES = new Set<string>(ARTISTS.map(a => a.name))

enum ViewState {
  Default,
  Authenticating,
  Scoring,
  Scored,
}

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [viewState, setViewState] = React.useState<ViewState>(ViewState.Default)

  const [followedArtists, setFollowedArtists] = React.useState<Artist[]>([])
  const [topArtists, setTopArtists] = React.useState<Artist[]>([])
  const [topTracks, setTopTracks] = React.useState<Track[]>([])
  const [myTracks, setMyTracks] = React.useState<Track[]>([])
  const [playlistTracks, setPlaylistTracks] = React.useState<Track[]>([])

  const [dataSyncDone, setDataSyncDone] = React.useState(false)
  const [scoreDone, setScoreDone] = React.useState(false)
  const [scoringStarted, setScoringStarted] = React.useState(0)

  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)

  React.useEffect(() => {
    setAuthState(Spotify.shared().authState)
    return Spotify.shared().onAuthStateChange(({ after }) => { setAuthState(after)})
  }, [])

  React.useEffect(() => {
    if (authState === AuthState.AUTHENTICATED) {
      console.log('authenticated')
      Promise.all([
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
    }
  }, [authState])

  React.useEffect(() => {
    if (!dataSyncDone) return

    console.log('scoring')
    const followedArtistCount = followedArtists.filter(a => ARTIST_NAMES.has(a.name)).length
    console.log('got', followedArtistCount, ' followed artists')
    const topArtistCount = topArtists.filter(a => ARTIST_NAMES.has(a.name)).length
    console.log('got', topArtistCount, ' top artists')
    const topTrackCount = topTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name))).length
    console.log('got', topTrackCount, ' top tracks')
    const myTrackCount = myTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name))).length
    console.log('got', myTrackCount, ' my tracks')
    const playlistTrackCount = playlistTracks.filter(t => _.any(t.artists, a => ARTIST_NAMES.has(a.name))).length
    console.log('got', playlistTrackCount, ' playlist tracks')

    const topCount = topArtistCount + topTrackCount
    const savedCount = myTrackCount + playlistTrackCount

    const TOP_SCORE = 20
    const FOLLOWED_SCORE = 10
    const SAVED_SCORE = 5

    const score = topCount * TOP_SCORE + followedArtistCount * FOLLOWED_SCORE + savedCount * SAVED_SCORE

    console.log('score', score)

    setScore(score)
    setScoreDone(true)
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

  const centerContent = () => {
    switch (viewState) {
      case ViewState.Default:
        return (
          <>
            <Text style={{ marginTop: 100, fontSize: 80, color: 'white', textAlign: 'center', fontWeight: 'bold', textTransform: "uppercase" }}>Are you a true fan?</Text>
            <Button onPress={authenticate} medium backgroundColor="white" textColor="#FF5CB8" textStyle={{ fontWeight: 'normal' }} style={{ width: 200, marginBottom: 50 }}>CHECK SPOTIFY</Button>
          </>
        )
      case ViewState.Authenticating:
        return null
      case ViewState.Scoring:
        return null
      case ViewState.Scored:
        return null
      default:
        return null
    }
  }

  return (
    <LinearGradient
      start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
      locations={[ 0.0, 0.3, 0.65, 1.0 ]}
      colors={['#5504F1', '#FF48C0', '#FF88BB', '#FF2D1D']}
      style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100%', width: '100%' }}>

      <View style={{ height: 120, width: '100%', flexDirection: 'column', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%', paddingRight: 20, paddingVertical: 20 }}>
          <Button onPress={share} medium backgroundColor="white" textColor="#550451" textStyle={{ fontWeight: 'normal' }} style={{ opacity: 0.4, width: 100 }}>SHARE</Button>
        </View>
        <Text style={{ fontSize: 24, color: '#A595FC', fontFamily: "RubikMonoOne-Regular" }}>MUSIC UNITES US!</Text>
      </View>
      <View style={{ flexGrow: 1, paddingHorizontal: 30, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
        {centerContent()}
      </View>

      <View style={{ height: 75, width: '100%' }}>

      </View>
    </LinearGradient>
  )
}

export default Connect