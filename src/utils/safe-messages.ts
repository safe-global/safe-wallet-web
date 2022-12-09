import { hashMessage, _TypedDataEncoder } from 'ethers/lib/utils'
import type { TypedDataDomain } from 'ethers'
import type { SafeInfo, SafeMessage, EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'

/**
 * Generates `SafeMessage` types for EIP-712
 * https://github.com/safe-global/safe-contracts/blob/main/contracts/handler/CompatibilityFallbackHandler.sol#L12
 * @param safe Safe which will sign the message
 * @param message Message to sign
 * @returns `SafeMessage` types for signing
 */
export const generateSafeMessageTypes = (safe: SafeInfo, message: string): EIP712TypedData => {
  return {
    domain: {
      chainId: safe.chainId,
      verifyingContract: safe.address.value,
    },
    types: {
      SafeMessage: [{ name: 'message', type: 'bytes' }],
    },
    message: {
      message,
    },
  }
}

export const getSafeMessageHash = (message: SafeMessage['message']): SafeMessage['messageHash'] => {
  // EIP-191
  if (typeof message === 'string') {
    return hashMessage(message)
  }

  // EIP-712
  // `ethers` doesn't require `EIP712Domain` and otherwise throws
  const { EIP712Domain: _, ...types } = message.types
  return _TypedDataEncoder.hash(message.domain as TypedDataDomain, types, message.message)
}
