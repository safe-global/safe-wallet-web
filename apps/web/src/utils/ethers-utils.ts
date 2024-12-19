import type { TransactionReceipt } from 'ethers'
import type { ErrorCode } from 'ethers'
import { Signature, type SignatureLike } from 'ethers'

// https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse
export enum EthersTxReplacedReason {
  repriced = 'repriced',
  cancelled = 'cancelled',
  replaced = 'replaced',
}

// TODO: Replace this with ethers v6 types once released and create similar helper to `asError`
export type EthersError = Error & { code: ErrorCode; reason?: EthersTxReplacedReason; receipt?: TransactionReceipt }

export const didRevert = (receipt?: { status?: number | null }): boolean => {
  return receipt?.status === 0
}

export const didReprice = (error: EthersError): boolean => {
  return error.reason === EthersTxReplacedReason.repriced
}

type TimeoutError = Error & {
  timeout: number
  code: 'TIMEOUT'
}

export const isTimeoutError = (value?: Error): value is TimeoutError => {
  return !!value && 'reason' in value && value.reason === 'timeout' && 'code' in value
}

export const splitSignature = (sigBytes: string): Signature => {
  return Signature.from(sigBytes)
}
export const joinSignature = (splitSig: SignatureLike): string => {
  return Signature.from(splitSig).serialized
}
