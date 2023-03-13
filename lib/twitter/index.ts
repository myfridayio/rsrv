
import { sleep } from "../util"
import Cache from './Cache'

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA7TjwEAAAAAjQjSffSrlDSlMU2E8iVIbRzO2iw%3DrA7RWtjtutQYqwwMfQeXUQ2kPjRC4pZ0G4POVJnEMlHkceoaqj'
const API_BASE = 'https://api.twitter.com/2/'

export const getHandle = async (): Promise<string | null> => {
  return Cache.shared().getHandle()
}

export const saveHandle = async(handle: string) => {
  handle = handle.trim()
  handle = handle.startsWith('@') ? handle.substring(1) : handle
  await Cache.shared().setHandle(handle)
}

export const clearHandle = async () => {
  await Cache.shared().clearHandle()
}

const twitter = async (path: string, params: { [key: string]: string | number } | undefined = undefined) => {
    let url = new URL(path, API_BASE).toString()
    if (params && Object.keys(params).length > 0) {
      const urlParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => urlParams.append(key, value.toString()))
      url = `${url}?${urlParams.toString()}`
    }
    console.log(url)
    const config = { method: 'GET', headers: { 'Authorization': `Bearer ${TOKEN}` } }
    const response = await fetch(url, config)
    return response.json()
}

const getFollowsPaging = async (userId: string, pagination_token: string | undefined = undefined): Promise<string[]> => {
  if (pagination_token) {
    await sleep(500)
  }

  const response = await twitter(`users/${userId}/following`, { max_results: 1000, ...(pagination_token ? { pagination_token } : null)})
  if (!response.data && response.detail) {
    throw response.detail
  }

  const { data, meta }: { data: { username: string }[], meta: { next_token?: string } } = response//await twitter(`users/${id}/following`)
  const following = data.map(({ username }) => username)
  if (meta && meta.next_token) {
    return following.concat(await getFollowsPaging(userId, meta.next_token))
  }
  return following
}

export const getFollows = async (handle: string): Promise<string[]> => {
  handle = handle.trim()
  handle = handle.startsWith('@') ? handle.substring(1) : handle

  const saved = await Cache.shared().getFollows(handle)
  if (saved) {
    console.log('cache hit on follows')
    return saved
  }
  const { data: { id } } = await twitter(`users/by/username/${handle}`)
  const follows = await getFollowsPaging(id)

  await Cache.shared().saveFollows(handle, follows)
  
  return follows
}