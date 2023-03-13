import SpotifyWebApi from 'spotify-web-api-node'
import { EmitterSubscription, Linking } from 'react-native'
import { EventEmitter } from 'eventemitter3'
import querystring from 'querystring'
import { AuthState, AuthStateChangeHandler } from './auth'
import { BatchQuery, Playlist, BatchResponse, Artist, Track, LinearBatchResponse, Batch, PlayedItem } from './types'
import PlaylistItem from './types/PlaylistItem'

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
  private expiresIn: number | undefined
  private _authState = AuthState.UNAUTHENTICATED
  private accessToken: string | undefined
  private refreshToken: string | undefined

  constructor() {
    this.linkListener = Linking.addEventListener('url', ({ url }) => this.onUrl(url))
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
      .then(() => {
        this.setAuthState(AuthState.AUTHENTICATED)
      })
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

  private async refreshAccessTokenIfNeeded() {
    if (!this.accessToken) {
      this.setAuthState(AuthState.UNAUTHENTICATED)
      throw "nope"
    }
    // console.log('expires at', this.expiresIn, 'now =', new Date().getTime(), 'token =', !!this.accessToken, this.authState)
    if (this.expiresIn && new Date().getTime() >= this.expiresIn - 1000) {
      await this.refreshAccessToken()
    }
  }

  private basicPostHeaders() {
    return { 
      'Authorization': `Basic ${BASIC_AUTH_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  private async refreshAccessToken() {
    console.log('refreshing access token')
    const url = new URL(ACCOUNT_BASE_URL)
    url.pathname = '/api/token'
    const body = new URLSearchParams({ grant_type: 'refresh_token', client_id: CLIENT_ID }).toString()
    const headers = this.basicPostHeaders()

    const result = await fetch(url.toString(), { method: 'post', body, headers })
    const { access_token, expires_in } = await result.json()
    console.log('got access token', access_token)

    this.accessToken = access_token
    this.expiresIn = new Date().getTime() + (expires_in * 1000)
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

    this.accessToken = access_token
    this.refreshToken = refresh_token
    this.expiresIn = new Date().getTime() + (expires_in * 1000)
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

    const headers = { Authorization: `Bearer ${this.accessToken}`}
    const response = await fetch(url.toString(), { method: 'GET', headers })
    if (response.ok) {
      console.log('SUCCESS @', url.toString())
      return response.json() as ResponseType
    } else {
      throw `ERROR @ ${url.toString()} - ${response.status} - ${response.statusText}`
    }
  }

  async getRecentlyPlayedTracks(): Promise<Track[]> {
    const params = { limit: 50 }
    const batch: Batch<PlayedItem> = await this.call('me/player/recently-played', params)
    const { items } = batch
    return items.map(item => item.track)
  }

  async getFollowedArtists() : Promise<Artist[]> {
    const params: BatchQuery = { type: 'artist', limit: 50 }
    const batch: BatchResponse<Artist, 'artists'> = await this.call('me/following', params)
    return batch.artists.items
  }

  async getTopArtists(): Promise<Artist[]> {
    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Artist> = await this.call('me/top/artists', params)
    return batch.items
  }

  async getTopTracks(): Promise<Track[]> {
    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Track> = await this.call('me/top/tracks', params)
    return batch.items
  }

  async getSavedTracks(): Promise<Track[]> {
    const params = { limit: 50 }
    const batch: LinearBatchResponse<Track> = await this.call('me/tracks', params)
    return batch.items
  }

  async getPlaylists(): Promise<Playlist[]> {
    const params: BatchQuery = { time_range: 'long_term', limit: 50 }
    const batch: LinearBatchResponse<Playlist> = await this.call('me/playlists', params)
    return batch.items
  }

  async getTracksForPlaylist(playlistId: string, offset: number | undefined = undefined): Promise<Track[]> {
    const params: BatchQuery = { limit: 50, ...(offset && { offset }) }
    const batch: LinearBatchResponse<PlaylistItem> = await this.call(`playlists/${playlistId}/tracks`, params)
    const { items, offset: responseOffset } = batch
    const tracks = items.map(i => i.track)
    if (batch.next) {
      const count = items.length
      return tracks.concat(await this.getTracksForPlaylist(playlistId, responseOffset + count))
    }
    return tracks
  }
}