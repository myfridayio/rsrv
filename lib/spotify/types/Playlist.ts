import type Image from './Image'

type Playlist = {
  id: string,
  name: string,
  href: string,
  description: string,
  type: string,
  uri: string,
  public: boolean,
  collaborative: boolean,
  snapshot_id: string,
  tracks: {
    href: string,
    total: number,
  },
  external_urls: { [key: string]: string },
  owner: {},
}

export default Playlist