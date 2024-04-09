
import AsyncStorage from '@react-native-async-storage/async-storage'

export default class Cache {
  private static _instance: Cache = new Cache()
  static shared = (): Cache => {
    return this._instance
  }

  async setHandle(handle: string) {
    await AsyncStorage.setItem('@Friday:twitter:handle', handle)
  }

  async getHandle(): Promise<string | null> {
    return AsyncStorage.getItem('@Friday:twitter:handle')
  }

  async clearHandle() {
    await AsyncStorage.removeItem('@Friday:twitter:handle')
  }

  async saveFollows(handle: string, follows: string[]) {
    await AsyncStorage.setItem(`@Friday:twitter:follows:${handle}`, JSON.stringify(follows))
  }

  async getFollows(handle: string): Promise<string[] | null> {
    const saved = await AsyncStorage.getItem(`@Friday:twitter:follows:${handle}`)
    return saved ? JSON.parse(saved) : null
  }
}