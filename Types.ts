export interface FakeNav {
    navigate: (route: string, args?: {}) => void
    goBack: () => void
    reset: (config: {}) => void
    addListener: (key: string, f: () => void) => (() => void)
}