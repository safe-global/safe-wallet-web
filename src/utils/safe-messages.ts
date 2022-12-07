import { hashMessage } from 'ethers/lib/utils'
import type { SafeInfo, SafeMessage, EIP712TypedData } from '@gnosis.pm/safe-react-gateway-sdk'

import { hashTypedData } from '@/utils/web3'

export const generateSafeMessageMessage = (message: SafeMessage['message']): string => {
  return typeof message === 'string' ? hashMessage(message) : hashTypedData(message)
}

/**
 * Generates `SafeMessage` typed data for EIP-712
 * https://github.com/safe-global/safe-contracts/blob/main/contracts/handler/CompatibilityFallbackHandler.sol#L12
 * @param safe Safe which will sign the message
 * @param message Message to sign
 * @returns `SafeMessage` types for signing
 */
export const generateSafeMessageTypedData = (safe: SafeInfo, message: SafeMessage['message']): EIP712TypedData => {
  return {
    domain: {
      chainId: safe.chainId,
      verifyingContract: safe.address.value,
    },
    types: {
      SafeMessage: [{ name: 'message', type: 'bytes' }],
    },
    message: {
      message: generateSafeMessageMessage(message),
    },
  }
}

export const generateSafeMessageHash = (safe: SafeInfo, message: SafeMessage['message']): string => {
  const typedData = generateSafeMessageTypedData(safe, message)
  return hashTypedData(typedData)
}
