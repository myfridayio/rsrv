export type SZero = () => void
export type AZero = () => Promise<void>
export type Zero = SZero | AZero

export type SReturns<Output> = () => Output
export type AReturns<Output> = () => Promise<Output>
export type Returns<Output> = SReturns<Output> | AReturns<Output>

export type Translates<Input,Output> = (arg: Input) => Output

export function id<T>(x: T) {
    return x
}

export async function repeatUntil<T>(f: Returns<T>, test: Translates<T,boolean>, everyMS: number, timeout: number, started:(number | null)=null): Promise<T> {
    if (started === null) {
        started = new Date().getTime()
    }
    const elapsedMillis = new Date().getTime() - started
    if (elapsedMillis >= timeout) {
        throw `Timed Out after ${elapsedMillis}ms`
    }
    const output: T = await f()
    if (!test(output)) {
        return repeatUntil(f, test, everyMS, timeout, started)
    }
    return output
}