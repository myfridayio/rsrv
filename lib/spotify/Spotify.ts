import { EmitterSubscription, Linking } from 'react-native'
import { EventEmitter } from 'eventemitter3'
import querystring from 'querystring'
import { AuthState, AuthStateChangeHandler } from './auth'
import { BatchQuery, Playlist, BatchResponse, Artist, Track, LinearBatchResponse, Batch, PlayedItem, Credentials, PlaylistItem } from './types'
import Cache from './Cache'
import { createSftBuilder } from '@metaplex-foundation/js'
import { Buffer } from 'buffer'

const CLIENT_ID     = '5adf97582e2149e9a9b0f3a91131c028'
const CLIENT_SECRET = '14b1696fcf904b48ac1ec1e2ca3c9a47'
const REDIRECT_URI  = 'friday://auth-spotify'

const BASIC_AUTH_TOKEN = Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')

const ACCOUNT_BASE_URL = 'https://accounts.spotify.com'
const API_BASE_URL = 'https://api.spotify.com/v1'

const SCOPES = ['user-follow-read', 'user-top-read', 'user-read-recently-played', 'user-library-read']

export default class Spotify {
  private static instance: Spotify
  static shared(): Spotify {
    if (!this.instance) {
      this.instance = new Spotify()
    }
    return this.instance
  }

  private emitter = new EventEmitter()

  private linkListener: EmitterSubscription
  private _authState = AuthState.UNAUTHENTICATED
  private _creds: Credentials | null = null

  constructor() {
    this.linkListener = Linking.addEventListener('url', ({ url }) => this.onUrl(url))
    Cache.shared().getCredentials().then(creds => {
      if (creds) {
        console.log('yay got creds')
        this.setCreds(creds)
      } else {
        console.log('no stored creds')
      }
    })
  }

  get authState() { return this._authState }

  onAuthStateChange(authDidChange: AuthStateChangeHandler) {
    this.emitter.addListener('authStateChange', authDidChange)
    return () => {
      this.emitter.removeListener('authStateChange', authDidChange)
    }
  }

  private setAuthState(authState: AuthState) {
    if (authState === this._authState) return
    console.log('auth state ->', authState)
    const before = this._authState
    this._authState = authState
    this.emitter.emit('authStateChange', { before, after: authState })
  }

  onUrl(url: string) {
    if (!url.startsWith(REDIRECT_URI)) return

    const parsed = new URL(url)
    const params: URLSearchParams = parsed.searchParams
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      this.setAuthState(AuthState.UNAUTHENTICATED)
    } else {
      this.acquireAccessToken(code)
      .catch(e => {
        console.error(e)
        this.setAuthState(AuthState.UNAUTHENTICATED)
      })
    }
  }

  constructAuthURL() {
    const base = 'https://accounts.spotify.com/authorize'
    const params = {
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      redirect_uri: REDIRECT_URI
    }
    return `${base}?${querystring.stringify(params)}`
  }
  
  isExpired() {
    return this._creds && new Date().getTime() >= this._creds.expire_millis - 1000
  }

  private async refreshAccessTokenIfNeeded() {
    if (!this._creds) {
      this.setAuthState(AuthState.UNAUTHENTICATED)
      throw "Spotify Not Authenticated"
    }

    if (this.isExpired()) {
      await this.refreshAccessToken()
    }
  }

  private basicPostHeaders() {
    return { 
      'Authorization': `Basic ${BASIC_AUTH_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  private setCreds(creds: Credentials) {
    this._creds = creds
    if (creds && creds.access_token) {
      this.setAuthState(AuthState.AUTHENTICATED)
    }
    Cache.shared().setCredentials(creds)
  }

  private async refreshAccessToken() {
    const creds = this._creds
    if (!creds) {
      throw "Not Authenticated"
    }
    console.log('refreshing access token')
    const url = new URL(ACCOUNT_BASE_URL)
    url.pathname = '/api/token'
    const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: creds.refresh_token }).toString()
    const headers = this.basicPostHeaders()

    const result = await fetch(url.toString(), { method: 'post', body, headers })
    const { access_token, expires_in } = await result.json()
    console.log('refresh got access token', access_token, 'expires_in', expires_in)

    this.setCreds({ ...creds, access_token, expire_millis: new Date().getTime() + (expires_in * 1000) })
  }

  private async acquireAccessToken(code: string) {
    console.log('acquiring access token')
    const url = new URL(ACCOUNT_BASE_URL)
    url.pathname = '/api/token'
    const body = new URLSearchParams({ grant_type: 'authorization_code', redirect_uri: REDIRECT_URI, code }).toString()
    const headers = this.basicPostHeaders()
  
    const response = await fetch(url.toString(), { method: 'post', body, headers })
    const { access_token, refresh_token, expires_in } = await response.json()
    if (!access_token) {
      throw "invalid response"
    }

    console.log('acquired', access_token, 'for', expires_in)
    this.setCreds({ access_token, refresh_token, expire_millis: new Date().getTime() + (expires_in * 1000) })
  }

  askUserToAuthenticate() {
    this.setAuthState(AuthState.PENDING)
    console.log(this.constructAuthURL())
    Linking.openURL(this.constructAuthURL())
  }

  async call<ResponseType>(path: string, params: {}) {
    await this.refreshAccessTokenIfNeeded()
    const url = new URL(API_BASE_URL)
    url.pathname = `/v1/${path.startsWith('/') ? path.substring(1) : path}`
    url.search = `?${querystring.stringify(params)}`

    const headers = { Authorization: `Bearer ${this._creds!.access_token}`}
    const response = await fetch(url.toString(), { method: 'GET', headers })
    if (response.ok) {
      console.log('SUCCESS @', url.toString())
      return response.json() as ResponseType
    } else {
      throw `ERROR @ ${url.toString()} - ${response.status} - ${response.statusText}`
    }
  }

  async getRecentlyPlayedTracks(): Promise<Track[]> {
    const saved = await Cache.shared().getRecentlyPlayedTracks()
    if (saved) {
      return saved
    }
    
    const params = { limit: 50 }
    const batch: Batch<PlayedItem> = await this.call('me/player/recently-played', params)
    const { items } = batch
    const tracks = items.map(item => item.track)

    await Cache.shared().setRecentlyPlayedTracks(tracks)
    return tracks
  }

  async getFollowedArtists() : Promise<Artist[]> {
    const saved = await Cache.shared().getFollowedArtists()
    if (saved) {
      return saved
    }
    
    const params: BatchQuery = { type: 'artist', limit: 50 }
    const batch: BatchResponse<Artist, 'artists'> = await this.call('me/following', params)
    const artists = batch.artists.items
    
    await Cache.shared().setFollowedArtists(artists)
    return artists
  }

  async getTopArtists(): Promise<Artist[]> {
    const saved = await Cache.shared().getTopArtists()
    if (saved) {
      return saved
    }

    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Artist> = await this.call('me/top/artists', params)
    const artists = batch.items

    await Cache.shared().setTopArtists(artists)
    return artists
  }

  async getTopTracks(): Promise<Track[]> {
    const saved = await Cache.shared().getTopTracks()
    if (saved) {
      return saved
    }

    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Track> = await this.call('me/top/tracks', params)
    const tracks = batch.items

    await Cache.shared().setTopTracks(tracks)
    return tracks
  }

  async getSavedTracks(): Promise<Track[]> {
    const saved = await Cache.shared().getSavedTracks()
    if (saved) {
      console.log('cache hit saved tracks')
      return saved
    }

    const params = { limit: 50 }
    const batch: LinearBatchResponse<Track> = await this.call('me/tracks', params)
    const tracks = batch.items

    await Cache.shared().setSavedTracks(tracks)
    return tracks
  }

  async getPlaylistTracks(): Promise<Track[]> {
    const playlists = await this.getPlaylists()
    const trackLists = await Promise.all(playlists.map(p => this.getTracksForPlaylist(p.id)))
    const ids = new Set<string>()
    const combinedTracks: Track[] = []
    trackLists.forEach(tracks => {
      tracks.forEach(track => {
        if (!track.id || ids.has(track.id)) return
        ids.add(track.id)
        combinedTracks.push(track)
      })
    })
    return combinedTracks
  }

  async getPlaylists(): Promise<Playlist[]> {
    const saved = await Cache.shared().getPlaylists()
    if (saved) {
      console.log('cache hit playlists')
      return saved
    }

    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Playlist> = await this.call('me/playlists', params)
    const playlists = batch.items

    await Cache.shared().setPlaylists(playlists)
    return playlists
  }

  async getTracksForPlaylist(playlistId: string, offset: number | undefined = undefined): Promise<Track[]> {
    if (!offset) {
      const saved = await Cache.shared().getPlaylistTracks(playlistId)
      if (saved) {
        console.log('cache hit playlist tracks')
        return saved
      }
    }

    const params: BatchQuery = { limit: 50, ...(offset && { offset }) }
    const batch: LinearBatchResponse<PlaylistItem> = await this.call(`playlists/${playlistId}/tracks`, params)
    const { items, offset: responseOffset } = batch
    let tracks = items.map(i => i.track)
    if (batch.next) {
      const count = items.length
      tracks = tracks.concat(await this.getTracksForPlaylist(playlistId, responseOffset + count))
    }

    if (!offset) {
      await Cache.shared().setPlaylistTracks(playlistId, tracks)
    }
    return tracks
  }
}