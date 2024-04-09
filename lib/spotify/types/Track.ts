import type Image from './Image'
import type Artist from './Artist'

type Track = {
  album: {
    album_type: string,
    total_tracks: number,
    available_markets: string[],
    external_urls: { [key: string]: string },
    href: string,
    id: string,
    images: Image[],
    name: string,
    release_date: string,
    release_date_precision: string,
    restrictions: { [key: string]: string },
    type: string,
    uri: string,
    copyrights: { text: string, type: string }[],
    external_ids: { [key: string]: string },
    genres: string[],
    label: string,
    popularity: number,
    album_group: string,
    artists: Artist[],
  },
  artists: Artist[],
  available_markets: string[],
  disc_number: number,
  duration_ms: number,
  explicit: boolean,
  external_ids: { [key: string]: string },
  href: string,
  id: string,
  is_playable: boolean,
  linked_from: {},
  restrictions: { [key: string]: string },
  name: string,
  popularity: number,
  preview_url: string,
  track_number: number,
  type: string,
  uri: string,
  is_local: boolean
}

export default Track