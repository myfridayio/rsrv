import * as React from "react"
import { View, Text } from "react-native"
import { Button } from "../views"
import Spotify, { AuthState } from '../lib/spotify'
import { Artist, Track } from '../lib/spotify/types'
import { Props } from '../lib/react/types'
import color from "../lib/ui/color"
import _ from 'underscore'

const Connect = ({ navigation }: Props<'Connect'>) => {
  const [followedArtists, setFollowedArtists] = React.useState<Artist[]>([])
  const [topArtists, setTopArtists] = React.useState<Artist[]>([])
  const [topTracks, setTopTracks] = React.useState<Track[]>([])
  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)

  React.useEffect(() => {
    setAuthState(Spotify.shared().authState)
    Spotify.shared().onAuthStateChange(({ after }) => { setAuthState(after)})
  }, [])

  React.useEffect(() => {
    if (authState === AuthState.AUTHENTICATED) {
      console.log('authenticated')
      Spotify.shared().getFollowedArtists().then(as => { console.log('got followed artists', as.length); setFollowedArtists(as) } )
      Spotify.shared().getTopArtists().then(as => { console.log('got top artists', as.length); setTopArtists(as) } )
      Spotify.shared().getTopTracks().then(as => { console.log('got top tracks', as.length); setTopTracks(as) } )
    }
  }, [authState])

  React.useEffect(() => {
    console.log('scoring')
    // followedArtists.forEach(a => console.log(a.name))
    // topArtists.forEach(a => console.log('TOP', a.name))
    // topTracks.forEach(t => console.log('Track:', t.name))
    let tempScore = 0
    for (const artist of followedArtists) {
      if (artist.name === 'Tribe Friday') {
        console.log('adding 5 to score because user follows Tribe Friday')
        tempScore += 5
      }
    }

    for (const artist of topArtists) {
      if (artist.name === 'Tribe Friday') {
        tempScore += 100
      }
    }

    for (const track of topTracks) {
      if (_.any(track.artists, a => a.name === 'Tribe Friday')) {
        tempScore += 100
      }
    }

    setScore(tempScore)
  }, [followedArtists, topArtists, topTracks])

  const authenticate = () => {
    if (authState !== AuthState.AUTHENTICATED) {
      console.log('authenticating')
      Spotify.shared().askUserToAuthenticate()
    } else {
      console.log('already authenticated')
    }
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 50 }}>
      {authState === AuthState.AUTHENTICATED ?
      <View style={{ marginVertical: 20 }}><Text>Authenticated</Text></View>
      :
      <Button style={{ marginVertical: 20 }} onPress={authenticate} disabled={authState !== AuthState.UNAUTHENTICATED}>Authenticate</Button>
      }

      <View style={{ width: 300, height: 300, borderRadius: 20, backgroundColor: authState === AuthState.AUTHENTICATED ? color.red : 'gray', padding: 30, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 120, color: 'white' }}>{score}</Text>
        <Text style={{ color: 'white' }}>Artist Score</Text>
      </View>
    </View>
  )
}

export default Connect