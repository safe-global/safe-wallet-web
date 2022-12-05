import { _TypedDataEncoder } from 'ethers/lib/utils'
import type { EIP712TypedData } from '@gnosis.pm/safe-react-gateway-sdk'
import type { TypedDataDomain } from 'ethers'

import { getWeb3 } from '@/hooks/wallets/web3'

export const signTypedData = async ({ domain, types, message }: EIP712TypedData): Promise<string> => {
  const web3 = getWeb3()

  if (!web3) {
    throw new Error('No wallet is connected.')
  }

  return web3.getSigner()._signTypedData(domain as TypedDataDomain, types, message)
}

export const hashTypedData = (typedData: EIP712TypedData): string => {
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = typedData.types
  return _TypedDataEncoder.hash(typedData.domain as TypedDataDomain, types, typedData.message)
}
