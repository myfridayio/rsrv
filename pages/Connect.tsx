import * as React from "react"
import { View, Text } from "react-native"
import { Button } from "../views"
import Spotify, { AuthState } from '../lib/spotify'
import { Artist } from '../lib/spotify/types'
import { Props } from '../lib/react/types'
import color from "../lib/ui/color"

export default function Connect({ navigation }: Props<'Connect'>) {
  const [followedArtists, setFollowedArtists] = React.useState<Artist[]>([])
  const [topArtists, setTopArtists] = React.useState<Artist[]>([])
  const [authState, setAuthState] = React.useState<AuthState>(AuthState.UNAUTHENTICATED)
  const [score, setScore] = React.useState(0)

  React.useEffect(() => {
    setAuthState(Spotify.shared().authState)
    Spotify.shared().onAuthStateChange(({ after }) => { setAuthState(after)})
  }, [])

  React.useEffect(() => {
    if (authState === AuthState.AUTHENTICATED) {
      console.log('authenticated')
      Spotify.shared().getFollowedArtists().then(as => { console.log('got followed', as.count); setFollowedArtists(as) } )
      Spotify.shared().getTopArtists().then(as => { console.log('got top', as.length); setTopArtists(as) } )
    }
  }, [authState])

  React.useEffect(() => {
    if (followedArtists.length > 0 && topArtists.length > 0) {
      console.log('evaluating followed and top artists')
      // followedArtists.forEach(a => console.log(a.name))
      // topArtists.forEach(a => console.log('TOP', a.name))
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
      setScore(tempScore)
    }
  }, [followedArtists, topArtists])

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