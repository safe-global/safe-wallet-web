import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'

export const didRevert = (receipt: TransactionReceipt): boolean => {
  return receipt.status === 0
}
