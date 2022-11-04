import { utils } from 'ethers'
import { generateTypedData } from '@gnosis.pm/safe-core-sdk-utils'
import type { SafeTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import ErrorCodes from '../exceptions/ErrorCodes'
import { logError } from '../exceptions'

export const generateSafeTxHash = (safe: SafeInfo, data: SafeTransactionData): string => {
  if (!isValidSafeVersion(safe.version)) {
    return ''
  }

  const typedData = generateTypedData({
    safeAddress: safe.address.value,
    safeVersion: safe.version,
    chainId: Number(safe.chainId),
    safeTransactionData: data,
  })

  // `ethers` generates `EIP712Domain` automatically
  const { EIP712Domain: _, ...types } = typedData.types

  let safeTxHash = ''

  try {
    const typedDataHash = utils._TypedDataEncoder.encode(
      typedData.domain,
      // @ts-ignore - the typedData.types.SafeTxData key is not recognised as a string
      types,
      typedData.message,
    )
    safeTxHash = utils.keccak256(typedDataHash)
  } catch (err) {
    logError(ErrorCodes._809, (err as Error).message)
  }

  return safeTxHash
}
