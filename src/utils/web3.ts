import { _TypedDataEncoder } from 'ethers/lib/utils'
import type { EIP712TypedData } from '@gnosis.pm/safe-react-gateway-sdk'
import type { TypedDataDomain } from 'ethers'

export const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types
  return _TypedDataEncoder.hash(typedData.domain as TypedDataDomain, types, typedData.message)
}

export const normalizeTypedData = (typedData: EIP712TypedData) => {
  const { EIP712Domain: _, ...types } = typedData.types
  return _TypedDataEncoder.getPayload(typedData.domain as TypedDataDomain, types, typedData.message)
}
