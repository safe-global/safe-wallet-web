import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'
import { ErrorCode } from '@ethersproject/logger'

// https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
export enum EthersTxReplacedReason {
  repriced = 'repriced',
  cancelled = 'cancelled',
  replaced = 'replaced',
}

export type EthersError = Error & { code: ErrorCode; reason: EthersTxReplacedReason; receipt: TransactionReceipt }

export const didRevert = (receipt: TransactionReceipt): boolean => {
  return receipt.status === 0
}

export const didReprice = (error: EthersError): boolean => {
  return error.code === ErrorCode.TRANSACTION_REPLACED && error.reason === EthersTxReplacedReason.repriced
}
