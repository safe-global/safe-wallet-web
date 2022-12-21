import { hashMessage } from 'ethers/lib/utils'
import { gte } from 'semver'
import type { SafeInfo, SafeMessage, EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'

import { hashTypedData } from '@/utils/web3'
import { validateAddress } from './validation'

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

export const supportsEIP1271 = ({ version, fallbackHandler }: SafeInfo): boolean => {
  const EIP1271_SUPPORTED_SAFE_VERSION = '1.0.0'
  // From v1.3.0, EIP-1271 support was moved to the CompatibilityFallbackHandler
  const EIP1271_FALLBACK_HANDLER_SUPPORTED_SAFE_VERSION = '1.3.0'

  if (!version) {
    return false
  }

  const isHandledByFallbackHandler = gte(version, EIP1271_FALLBACK_HANDLER_SUPPORTED_SAFE_VERSION)
  if (isHandledByFallbackHandler) {
    // We only check if any fallback Handler is set as we expect / assume that users who overwrite the fallback handler by a custom one know what they are doing
    return fallbackHandler !== null && validateAddress(fallbackHandler.value) === undefined
  }

  return gte(version, EIP1271_SUPPORTED_SAFE_VERSION)
}
