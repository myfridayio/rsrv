import type Track from './Track'

type PlaylistItem = {
  added_at: string,
  added_by: {},
  is_local: boolean,
  track: Track,
}

export default PlaylistItem