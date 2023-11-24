import type { BigNumber } from 'ethers'
import type { NewSafeFormData } from '@/components/new-safe/create'

export type NamedAddress = {
  name: string
  address: string
  ens?: string
}

export type PendingSafeTx = {
  data: string
  from: string
  nonce: number
  to: string
  value: BigNumber
  startBlock: number
}

export type PendingSafeData = NewSafeFormData & {
  txHash?: string
  tx?: PendingSafeTx
  taskId?: string
}

export type PendingSafeByChain = Record<string, PendingSafeData | undefined>
