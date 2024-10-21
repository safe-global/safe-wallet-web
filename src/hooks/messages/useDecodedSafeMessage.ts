import { getDecodedMessage } from '@/components/safe-apps/utils'
import {
  generateSafeMessageMessage,
  generateSafeMessageHash,
  generateSafeMessageTypedData,
} from '@/utils/safe-messages'
import { getTypedDataDomainHash, getTypedDataMessageHash } from '@/utils/web3'
import type { EIP712TypedData, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo } from 'react'

/**
 * Returns the decoded message, the hash of the `message` and the hash of the `safeMessage`.
 * The `safeMessageMessage` is the value inside the SafeMessage and the `safeMessageHash` gets signed if the connected wallet does not support `eth_signTypedData`.
 *
 * @param message message as string, UTF-8 encoded hex string or EIP-712 Typed Data
 * @param safe SafeInfo of the opened Safe
 * @returns `{
 *   decodedMessage,
 *   safeMessageMessage,
 *   safeMessageHash
 * }`
 */
const useDecodedSafeMessage = (
  message: string | EIP712TypedData,
  safe: SafeInfo,
): {
  decodedMessage: string | EIP712TypedData
  safeMessageMessage: string
  safeMessageHash: string
  messageHash: string
  domainHash: string
} => {
  // Decode message if UTF-8 encoded
  const decodedMessage = useMemo(() => {
    return typeof message === 'string' ? getDecodedMessage(message) : message
  }, [message])

  // Get `SafeMessage` message
  const safeMessageMessage = useMemo(() => {
    return generateSafeMessageMessage(decodedMessage)
  }, [decodedMessage])

  // Get `SafeMessage` hash
  const safeMessageHash = useMemo(() => {
    return generateSafeMessageHash(safe, decodedMessage)
  }, [safe, decodedMessage])

  const messageHash = useMemo(() => {
    const typedData = generateSafeMessageTypedData(safe, message)
    return getTypedDataMessageHash('SafeMessage', typedData)
  }, [message, safe])

  const domainHash = useMemo(() => {
    const typedData = generateSafeMessageTypedData(safe, message)
    return getTypedDataDomainHash(typedData)
  }, [message, safe])

  return {
    decodedMessage,
    safeMessageMessage,
    safeMessageHash,
    messageHash,
    domainHash,
  }
}

export default useDecodedSafeMessage
