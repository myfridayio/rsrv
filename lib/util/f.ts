export type Thunk = () => void
export type AsyncThunk = () => Promise<void>
export type AnyThunk = Thunk | AsyncThunk
