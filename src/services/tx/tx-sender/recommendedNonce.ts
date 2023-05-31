import type { SafeTransactionEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation, postSafeGasEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import type { MetaTransactionData, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import { isLegacyVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { EMPTY_DATA } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { Errors, logError } from '@/services/exceptions'
import { getAndValidateSafeSDK } from './sdk'

const estimateSafeTxGas = async (
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

export const getRecommendedTxParams = async (
  safeTxData: SafeTransactionDataPartial,
): Promise<{ nonce: number; safeTxGas: number } | undefined> => {
  const safeSDK = getAndValidateSafeSDK()
  const chainId = await safeSDK.getChainId()
  const safeAddress = safeSDK.getAddress()
  const contractVersion = await safeSDK.getContractVersion()
  const isSafeTxGasRequired = isLegacyVersion(contractVersion)

  let estimation: SafeTransactionEstimation | undefined

  try {
    estimation = await estimateSafeTxGas(String(chainId), safeAddress, safeTxData)
  } catch (e) {
    try {
      // If the initial transaction data causes the estimation to fail,
      // we retry the request with a cancellation transaction to get the
      // recommendedNonce, even if the original transaction will likely fail
      const cancellationTxParams = { ...safeTxData, data: EMPTY_DATA, to: safeAddress, value: '0' }
      estimation = await estimateSafeTxGas(String(chainId), safeAddress, cancellationTxParams)
    } catch (e) {
      logError(Errors._616, (e as Error).message)
      return
    }
  }

  return {
    nonce: estimation.recommendedNonce,
    safeTxGas: isSafeTxGasRequired ? Number(estimation.safeTxGas) : 0,
  }
}
