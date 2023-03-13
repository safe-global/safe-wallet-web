import { _TypedDataEncoder } from 'ethers/lib/utils'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import type { TypedDataDomain } from 'ethers'

export type EIP712Normalized = EIP712TypedData & { primaryType: string }

export const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types
  return _TypedDataEncoder.hash(typedData.domain as TypedDataDomain, types, typedData.message)
}

export const normalizeTypedData = (typedData: EIP712TypedData): EIP712Normalized => {
  const { EIP712Domain: _, ...types } = typedData.types
  return _TypedDataEncoder.getPayload(typedData.domain as TypedDataDomain, types, typedData.message)
}
