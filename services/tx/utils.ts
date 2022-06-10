import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'

export const didRevert = (receipt: TransactionReceipt) => {
  return receipt.status === 0
}
