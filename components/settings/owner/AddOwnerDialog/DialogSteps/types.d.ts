export interface ChangeOwnerData {
  removedOwner?: OwnerData
  newOwner: OwnerData
  threshold?: number
}

export interface OwnerData {
  address: {
    address: string
    prefix?: string
  }
  name?: string
}
