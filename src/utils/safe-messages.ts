import { hashMessage } from 'ethers/lib/utils'
import type { SafeInfo, SafeMessage, EIP712TypedData } from '@gnosis.pm/safe-react-gateway-sdk'

import { hashTypedData } from '@/utils/web3'

/**
 * Generates `SafeMessage` types for EIP-712
 * https://github.com/safe-global/safe-contracts/blob/main/contracts/handler/CompatibilityFallbackHandler.sol#L12
 * @param safe Safe which will sign the message
 * @param message Message to sign
 * @returns `SafeMessage` types for signing
 */
export const generateSafeMessageTypes = (safe: SafeInfo, message: SafeMessage['message']): EIP712TypedData => {
  return {
    domain: {
      chainId: safe.chainId,
      verifyingContract: safe.address.value,
    },
    types: {
      SafeMessage: [{ name: 'message', type: 'bytes' }],
    },
    message: {
      message: typeof message === 'string' ? hashMessage(message) : hashTypedData(message),
    },
  }
}

export const generateSafeMessageHash = (safe: SafeInfo, message: SafeMessage['message']): string => {
  const typedData = generateSafeMessageTypes(safe, message)
  return hashTypedData(typedData)
}
