import { Track, Artist, Playlist, Credentials } from './types'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class Cache {
  private static _instance: Cache = new Cache()
  static shared = (): Cache => {
    return this._instance
  }

  async clearCreds() {
    await AsyncStorage.removeItem('@Friday:spotify:creds')
  }

  async getCredentials(): Promise<Credentials|null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:creds')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setCredentials(creds: Credentials) {
    if (creds) {
      await AsyncStorage.setItem('@Friday:spotify:creds', JSON.stringify(creds))
    } else {
      await AsyncStorage.removeItem('@Friday:spotify:creds')
    }
  }

  async getRecentlyPlayedTracks(): Promise<Track[] | null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:recentTracks')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setRecentlyPlayedTracks(tracks: Track[]) {
    await AsyncStorage.setItem('@Friday:spotify:recentTracks', JSON.stringify(tracks))
    await AsyncStorage.setItem('@Friday:spotify:recentTracks:stored', new Date().getTime().toString())
  }

  async getTopTracks(): Promise<Track[] | null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:topTracks')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setTopTracks(tracks: Track[]) {
    await AsyncStorage.setItem('@Friday:spotify:topTracks', JSON.stringify(tracks))
    await AsyncStorage.setItem('@Friday:spotify:topTracks:stored', new Date().getTime().toString())
  }

  async getFollowedArtists(): Promise<Artist[] | null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:followedArtists')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setFollowedArtists(artists: Artist[]) {
    await AsyncStorage.setItem('@Friday:spotify:followedArtists', JSON.stringify(artists))
    await AsyncStorage.setItem('@Friday:spotify:followedArtists:stored', new Date().getTime().toString())
  }

  async getTopArtists(): Promise<Artist[] | null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:topArtists')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setTopArtists(tracks: Artist[]) {
    await AsyncStorage.setItem('@Friday:spotify:topArtists', JSON.stringify(tracks))
    await AsyncStorage.setItem('@Friday:spotify:topArtists:stored', new Date().getTime().toString())
  }

  async getSavedTracks(): Promise<Track[]> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:savedTracks')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setSavedTracks(tracks: Track[]) {
    await AsyncStorage.setItem('@Friday:spotify:savedTracks', JSON.stringify(tracks))
    await AsyncStorage.setItem('@Friday:spotify:savedTracks:stored', new Date().getTime().toString())
  }

  async getPlaylists(): Promise<Playlist[] | null> {
    const storedJSON = await AsyncStorage.getItem('@Friday:spotify:playlists')
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setPlaylists(playlists: Playlist[]) {
    await AsyncStorage.setItem('@Friday:spotify:playlists', JSON.stringify(playlists))
    await AsyncStorage.setItem('@Friday:spotify:playlists:stored', new Date().getTime().toString())
  }

  async getPlaylistTracks(playlistId: string): Promise<Track[] | null> {
    const storedJSON = await AsyncStorage.getItem(`@Friday:spotify:playlists:${playlistId}:tracks`)
    return storedJSON ? JSON.parse(storedJSON) : null
  }

  async setPlaylistTracks(playlistId: string, tracks: Track[]) {
    await AsyncStorage.setItem(`@Friday:spotify:playlists:${playlistId}:tracks`, JSON.stringify(tracks))
    await AsyncStorage.setItem(`@Friday:spotify:playlists:${playlistId}:tracks:stored`, new Date().getTime().toString())
  }
}