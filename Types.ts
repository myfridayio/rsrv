export interface FakeNav {
    navigate: (route: string) => void
    goBack: () => void
    addListener: (key: string, f: () => void) => (() => void)
}