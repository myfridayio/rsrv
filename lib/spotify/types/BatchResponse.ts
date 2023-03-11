import type Batch from './Batch'

type BatchResponse<ItemType, ItemKey extends string> = {
  [key in ItemKey]: Batch<ItemType>
}

export default BatchResponse