

export const sleep = async (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export interface PadOpts {
    with: string,
    to: number,
    side: 'left' | 'right'
}

export const pad = (s: string, opts: PadOpts) => {
    let ret = s
    while (ret.length < opts.to) {
        switch (opts.side) {
            case 'right':
                ret = ret + opts.with
            case 'left':
                ret = opts.with + ret
        }
    }
    return ret
}

export const padZeros = (s: string, n: number): string => {
    return pad(s, { with: '0', to: n, side: 'left'})
}

export const commafy = (n: number): string => {
    if (n < 1000) {
        return n.toString()
    }
    return commafy(Math.round(n / 1000)) + ',' + padZeros(commafy(n % 1000), 3)
}