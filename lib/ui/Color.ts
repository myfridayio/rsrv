const HEXRGB = /^#[a-fA-F0-9]{6}$/
const HEXRGBA = /^(#[a-fA-F0-9]{6})([a-fA-F0-9]{2})$/
const RGB = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/
const RGBA = /^rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/

const floatToHex = (decimal: number): string => Math.round(decimal * 255).toString(16).padStart(2, '0')
const hexToFloat = (hex: string): number => parseInt(hex, 16) / 255
const hexToInt = (hex: string): number => parseInt(hex, 16)
const intToHex = (int: number): string => int.toString(16).padStart(2, '0')


export default class Color {
  private r: number = 255
  private g: number = 255
  private b: number = 255
  private a: number = 1.0

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  at(opacity: number): Color {
    return new Color(this.r, this.g, this.b, opacity)
  }

  get rgb() {
    const { r, g, b } = this
    return `rgb(${[r, g, b].join(', ')})`
  }

  get rgba() {
    const { r, g, b, a } = this
    return `rgba(${[r, g, b, a].join(', ')})`
  }

  get hex() {
    const { r, g, b, a } = this
    if (a === 1.0) {
      return '#' + [r, g, b].map(intToHex).join('')
    } else {
      return '#' + [r, g, b].map(intToHex).join('') + floatToHex(a)
    }
  }

  static parse(s: string) {
    s = NAMED_RGB_CODES[s] || s

    let r = 1.0
    let g = 1.0
    let b = 1.0
    let a = 1.0
    if (HEXRGB.exec(s)) {
      r = hexToInt(s.substring(1, 3))
      g = hexToInt(s.substring(3, 5))
      b = hexToInt(s.substring(5, 7))
    } else if (HEXRGBA.exec(s)) {
      r = hexToInt(s.substring(1, 3))
      g = hexToInt(s.substring(3, 5))
      b = hexToInt(s.substring(5, 7))
      a = hexToFloat(s.substring(7))
    } else {

      const rgb = RGB.exec(s)
      if (rgb) {
        [r, g, b] = rgb.slice(1).map(parseInt)
      }
    
      const rgba = RGBA.exec(s)
      if (rgba) {
        [r, g, b] = rgba.slice(1,4).map(parseInt)
        a = parseFloat(rgba[4])
      }
    }
    return new Color(r, g, b, a)
  }
}



export const NAMED_RGB_CODES: { [key: string]: string } = {
  white: '#FFFFFF',
  silver: '#C0C0C0',
  gray: '#808080',
  black: '#000000',

  red: '#FF0000',
  maroon: '#800000',
  orange: '#FFA500',
  yellow: '#FFFF00',

  green: '#008000',
  lime: '#00FF00',
  lightgreen: '#90EE90',
  olive: '#808000',

  blue: '#0000FF',
  navy: '#000080',
  teal: '#008080',
  lightblue: '#ADD8E6',
  aqua: '#00FFFF',
    
  indigo: '#4B0082',
  purple: '#FF00FF',
  violet: '#EE82EE',
  fuchsia: '#FF00FF',
  pink: '#FFC0CB',
  lightpink: '#FFB6C1',
  transparent: '#00000000'
}