type LinearBatchResponse<ItemType> = {
  href: string,
  limit: number,
  next?: string,
  previous?: string,
  offset: number,
  total: number,
  items: ItemType[]
}

export default LinearBatchResponse