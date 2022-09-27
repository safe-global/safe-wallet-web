import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'
import { ErrorCode } from '@ethersproject/logger'

export type EthersError = Error & { code: ErrorCode; reason: string }

export const didRevert = (receipt: TransactionReceipt): boolean => {
  return receipt.status === 0
}
