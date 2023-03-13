import type Track from './Track'

type PlayedItem = {
  track: Track,
  played_at: string,
  context: {},
}

export default PlayedItem