export default interface Artist {
  name: string,
  id: string,
  href: string,
  type: 'artist',
  uri: string,
  external_urls: { [key: string]: string },
  followers: { href: string, total: number },
  genres: string[],
  images: { url: string, height: number, width: number }[]
}