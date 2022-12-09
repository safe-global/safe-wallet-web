import { isLegacyVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { Errors, logError } from '@/services/exceptions'
import type { SafeTransactionEstimation, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionDetails, Operation, postSafeGasEstimation } from '@safe-global/safe-gateway-typescript-sdk'
import type { AddOwnerTxParams, RemoveOwnerTxParams, SwapOwnerTxParams } from '@safe-global/safe-core-sdk'
import type { MetaTransactionData, SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import { EMPTY_DATA } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import extractTxInfo from '../extractTxInfo'
import { getAndValidateSafeSDK } from './sdk'
import type Safe from '@safe-global/safe-core-sdk'

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

const getRecommendedTxParams = async (
  txParams: SafeTransactionDataPartial,
): Promise<{ nonce: number; safeTxGas: number } | undefined> => {
  const safeSDK = getAndValidateSafeSDK()
  const chainId = await safeSDK.getChainId()
  const safeAddress = safeSDK.getAddress()
  const contractVersion = await safeSDK.getContractVersion()
  const isSafeTxGasRequired = isLegacyVersion(contractVersion)

  let estimation: SafeTransactionEstimation | undefined

  try {
    estimation = await estimateSafeTxGas(String(chainId), safeAddress, txParams)
  } catch (e) {
    try {
      // If the initial transaction data causes the estimation to fail,
      // we retry the request with a cancellation transaction to get the
      // recommendedNonce, even if the original transaction will likely fail
      const cancellationTxParams = { ...txParams, data: EMPTY_DATA, to: safeAddress, value: '0' }
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

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial, nonce?: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()

  // If the nonce is not provided, we get the recommended one
  if (nonce === undefined) {
    const recParams = (await getRecommendedTxParams(txParams)) || {}
    txParams = { ...txParams, ...recParams }
  } else {
    // Otherwise, we use the provided one
    txParams = { ...txParams, nonce }
  }

  return safeSDK.createTransaction({ safeTransactionData: txParams })
}

const withRecommendedNonce = async (
  createFn: (safeSDK: Safe) => Promise<SafeTransaction>,
): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  const tx = await createFn(safeSDK)
  return createTx(tx.data)
}

/**
 * Create a multiSendCallOnly transaction from an array of MetaTransactionData and options
 *
 * If only one tx is passed it will be created without multiSend and without onlyCalls.
 */
export const createMultiSendCallOnlyTx = async (txParams: MetaTransactionData[]): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) =>
    safeSDK.createTransaction({
      safeTransactionData: txParams,
      onlyCalls: true,
    }),
  )
}

export const createRemoveOwnerTx = async (txParams: RemoveOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createRemoveOwnerTx(txParams))
}

export const createAddOwnerTx = async (txParams: AddOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createAddOwnerTx(txParams))
}

export const createSwapOwnerTx = async (txParams: SwapOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createSwapOwnerTx(txParams))
}

export const createUpdateThresholdTx = async (threshold: number): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createChangeThresholdTx(threshold))
}

export const createRemoveModuleTx = async (moduleAddress: string): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createDisableModuleTx(moduleAddress))
}

export const createRemoveGuardTx = async (): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createDisableGuardTx())
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createRejectionTransaction(nonce)
}

/**
 * Prepare a SafeTransaction from Client Gateway / Tx Queue
 */
export const createExistingTx = async (
  chainId: string,
  safeAddress: string,
  txId: string,
  txDetails?: TransactionDetails,
): Promise<SafeTransaction> => {
  // Get the tx details from the backend if not provided
  txDetails = txDetails || (await getTransactionDetails(chainId, txId))

  // Convert them to the Core SDK tx params
  const { txParams, signatures } = extractTxInfo(txDetails, safeAddress)

  // Create a tx and add pre-approved signatures
  const safeTx = await createTx(txParams, txParams.nonce)
  Object.entries(signatures).forEach(([signer, data]) => {
    safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
  })

  return safeTx
}
