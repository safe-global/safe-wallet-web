export interface ChangeOwnerData {
  removedOwner?: OwnerData
  newOwner: OwnerData
  threshold?: number
}

export interface OwnerData {
  address: string
  name?: string
}
