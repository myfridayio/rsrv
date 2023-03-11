

export enum AuthState {
  UNAUTHENTICATED,
  AUTHENTICATED,
  PENDING
}

export type AuthStateChange = { before: AuthState, after: AuthState }

export type AuthStateChangeHandler = (change: AuthStateChange) => void