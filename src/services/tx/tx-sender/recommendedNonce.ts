import type { SafeTransactionEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation, postSafeGasEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import type { MetaTransactionData, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import { isLegacyVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { Errors, logError } from '@/services/exceptions'
import { getAndValidateSafeSDK } from './sdk'
import { EMPTY_DATA } from '@safe-global/safe-core-sdk/dist/src/utils/constants'

const fetchRecommendedParams = async (
  chainId: string,
  safeAddress: string,
  txParams: MetaTransactionData,
): Promise<SafeTransactionEstimation> => {
  return postSafeGasEstimation(chainId, safeAddress, {
    to: txParams.to,
    value: txParams.value,
    data: txParams.data,
    operation: (txParams.operation as unknown as Operation) || Operation.CALL,
  })
}

export const getSafeTxGas = async (
  chainId: string,
  safeAddress: string,
  safeTxData: SafeTransactionDataPartial,
): Promise<number | undefined> => {
  const safeSDK = getAndValidateSafeSDK()
  const contractVersion = await safeSDK.getContractVersion()
  const isSafeTxGasRequired = isLegacyVersion(contractVersion)

  // For 1.3.0+ Safes safeTxGas is not required
  if (!isSafeTxGasRequired) return 0

  try {
    const estimation = await fetchRecommendedParams(chainId, safeAddress, safeTxData)
    return Number(estimation.safeTxGas)
  } catch (e) {
    logError(Errors._616, e)
  }
}

export const getRecommendedNonce = async (chainId: string, safeAddress: string): Promise<number | undefined> => {
  const blankTxParams = { data: EMPTY_DATA, to: safeAddress, value: '0' }
  try {
    const estimation = await fetchRecommendedParams(chainId, safeAddress, blankTxParams)
    return Number(estimation.recommendedNonce)
  } catch (e) {
    logError(Errors._616, e)
  }
}
