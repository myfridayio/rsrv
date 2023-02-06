export interface FakeNav {
    navigate: (route: string) => void
    goBack: () => void
    reset: (config: {}) => void
    addListener: (key: string, f: () => void) => (() => void)
}