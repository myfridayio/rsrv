type Batch<ItemType> = {
  href: string,
  limit: number,
  next?: string,
  cursors: {
    after?: string,
    before?: string,
  },
  items: ItemType[]
}

export default Batch