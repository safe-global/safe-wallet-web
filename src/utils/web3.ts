import { TypedDataEncoder } from 'ethers'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import type { TypedDataDomain } from 'ethers'

export type EIP712Normalized = EIP712TypedData & { primaryType: string }

export const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types
  return TypedDataEncoder.hash(typedData.domain as TypedDataDomain, types, typedData.message)
}

export const normalizeTypedData = (typedData: EIP712TypedData): EIP712Normalized => {
  const { EIP712Domain: _, ...types } = typedData.types
  const payload = TypedDataEncoder.getPayload(typedData.domain as TypedDataDomain, types, typedData.message)

  // ethers v6 converts the chainId to a hex value:
  // https://github.com/ethers-io/ethers.js/blob/50b74b8806ef2064f2764b09f89c7ac75fda3a3c/src.ts/hash/typed-data.ts#L75
  // Our SDK expects a number, that's why we convert it here
  // If this gets fixed here: https://github.com/safe-global/safe-eth-py/issues/748
  // we can remove this workaround
  if (payload.domain.chainId) {
    payload.domain.chainId = Number(BigInt(payload.domain.chainId))
  }

  return payload
}
