import {
  getTransactionDetails,
  Operation,
  postSafeGasEstimation,
  SafeTransactionEstimation,
  TransactionDetails,
} from '@gnosis.pm/safe-react-gateway-sdk'
import {
  MetaTransactionData,
  SafeTransaction,
  SafeTransactionDataPartial,
  TransactionOptions,
  TransactionResult,
} from '@gnosis.pm/safe-core-sdk-types'
import { RequestId } from '@gnosis.pm/safe-apps-sdk'
import extractTxInfo from '@/services/tx/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'
import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { didRevert } from '@/utils/ethers-utils'
import Safe, { RemoveOwnerTxParams } from '@gnosis.pm/safe-core-sdk'
import { AddOwnerTxParams, SwapOwnerTxParams } from '@gnosis.pm/safe-core-sdk/dist/src/Safe'
import MultiSendCallOnlyEthersContract from '@gnosis.pm/safe-ethers-lib/dist/src/contracts/MultiSendCallOnly/MultiSendCallOnlyEthersContract'
import { Web3Provider } from '@ethersproject/providers'
import { ContractTransaction, ethers } from 'ethers'
import { SpendingLimitTxParams } from '@/components/tx/modals/TokenTransferModal/ReviewSpendingLimitTx'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'

const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }
  return safeSDK
}

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

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial, nonce?: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()

  // Set the recommended nonce and safeTxGas if not provided
  if (nonce === undefined) {
    const chainId = await safeSDK.getChainId()
    const estimation = await estimateSafeTxGas(String(chainId), safeSDK.getAddress(), txParams)
    txParams = { ...txParams, nonce: estimation.recommendedNonce, safeTxGas: Number(estimation.safeTxGas) }
  } else {
    txParams = { ...txParams, nonce }
  }

  return safeSDK.createTransaction({ safeTransactionData: txParams })
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

const withRecommendedNonce = async (
  createFn: (safeSDK: Safe) => Promise<SafeTransaction>,
): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  const tx = await createFn(safeSDK)
  return createTx(tx.data)
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

/**
 * Propose a transaction
 * If txId is passed, it's an existing tx being signed
 */
export const dispatchTxProposal = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  safeTx: SafeTransaction,
  txId?: string,
): Promise<TransactionDetails> => {
  const safeSDK = getAndValidateSafeSDK()
  const safeTxHash = await safeSDK.getTransactionHash(safeTx)

  let proposedTx: TransactionDetails | undefined
  try {
    proposedTx = await proposeTx(chainId, safeAddress, sender, safeTx, safeTxHash)
  } catch (error) {
    if (txId) {
      txDispatch(TxEvent.SIGNATURE_PROPOSE_FAILED, { txId, error: error as Error })
    } else {
      txDispatch(TxEvent.PROPOSE_FAILED, { error: error as Error })
    }
    throw error
  }

  txDispatch(txId ? TxEvent.SIGNATURE_PROPOSED : TxEvent.PROPOSED, { txId: proposedTx.txId })

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (
  safeTx: SafeTransaction,
  shouldEthSign: boolean,
  txId?: string,
): Promise<SafeTransaction> => {
  const sdk = getAndValidateSafeSDK()
  const signingMethod = shouldEthSign ? 'eth_sign' : 'eth_signTypedData'

  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await sdk.signTransaction(safeTx, signingMethod)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, { txId, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.SIGNED, { txId })

  return signedTx
}

/**
 * On-Chain sign a transaction
 */
export const dispatchOnChainSigning = async (safeTx: SafeTransaction, provider: Web3Provider, txId?: string) => {
  const sdk = getAndValidateSafeSDK()
  const safeTxHash = await sdk.getTransactionHash(safeTx)

  const signer = provider.getSigner()
  const ethersAdapter = new EthersAdapter({
    ethers,
    signer: signer.connectUnchecked(),
  })

  txDispatch(TxEvent.EXECUTING, { groupKey: safeTxHash })

  try {
    // With the unchecked signer, the contract call resolves once the tx
    // has been submitted in the wallet not when it has been executed
    const sdkUnchecked = await sdk.connect({ ethAdapter: ethersAdapter })
    await sdkUnchecked.approveTransactionHash(safeTxHash)
  } catch (err) {
    txDispatch(TxEvent.FAILED, { groupKey: safeTxHash, error: err as Error })
    throw err
  }

  txDispatch(TxEvent.AWAITING_ON_CHAIN_SIGNATURE, { groupKey: safeTxHash })

  return safeTx
}

/**
 * Execute a transaction
 */
export const dispatchTxExecution = async (
  txId: string,
  safeTx: SafeTransaction,
  txOptions?: TransactionOptions,
): Promise<string> => {
  const sdk = getAndValidateSafeSDK()

  txDispatch(TxEvent.EXECUTING, { txId })

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    result = await sdk.executeTransaction(safeTx, txOptions)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROCESSING, { txId, txHash: result.hash })

  // Asynchronously watch the tx to be mined/validated
  result.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { txId, receipt, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { txId, receipt })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { txId, error: error as Error })
    })

  return result.hash
}

export const dispatchBatchExecution = async (
  txs: TransactionDetails[],
  multiSendContract: MultiSendCallOnlyEthersContract,
  multiSendTxData: string,
  provider: Web3Provider,
) => {
  const groupKey = multiSendTxData

  txs.forEach(({ txId }) => {
    txDispatch(TxEvent.EXECUTING, { txId, groupKey })
  })

  let result: TransactionResult | undefined

  try {
    result = await multiSendContract.contract.connect(provider.getSigner()).multiSend(multiSendTxData)
  } catch (err) {
    txs.forEach(({ txId }) => {
      txDispatch(TxEvent.FAILED, { txId, error: err as Error, groupKey })
    })
    throw err
  }

  txs.forEach(({ txId }) => {
    txDispatch(TxEvent.PROCESSING, { txId, txHash: result!.hash, groupKey })
  })

  result.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.REVERTED, {
            txId,
            receipt,
            error: new Error('Transaction reverted by EVM'),
            groupKey,
          })
        })
      } else {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.PROCESSED, {
            txId,
            receipt,
            groupKey,
          })
        })
      }
    })
    .catch((err) => {
      txs.forEach(({ txId }) => {
        txDispatch(TxEvent.FAILED, {
          txId,
          error: err as Error,
          groupKey,
        })
      })
    })

  return result.hash
}

export const dispatchSpendingLimitTxExecution = async (
  txParams: SpendingLimitTxParams,
  txOptions: TransactionOptions,
  chainId: string,
  provider: Web3Provider,
) => {
  const contract = getSpendingLimitContract(chainId, provider.getSigner())

  const id = JSON.stringify(txParams)

  txDispatch(TxEvent.EXECUTING, { groupKey: id })

  let result: ContractTransaction | undefined
  try {
    result = await contract.executeAllowanceTransfer(
      txParams.safeAddress,
      txParams.token,
      txParams.to,
      txParams.amount,
      txParams.paymentToken,
      txParams.payment,
      txParams.delegate,
      txParams.signature,
      txOptions,
    )
  } catch (error) {
    txDispatch(TxEvent.FAILED, { groupKey: id, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROCESSING_MODULE, {
    groupKey: id,
    txHash: result.hash,
  })

  result
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { groupKey: id, receipt, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { groupKey: id, receipt })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { groupKey: id, error: error as Error })
    })

  return result?.hash
}

export const dispatchSafeAppsTx = (txId: string, safeAppRequestId: RequestId) => {
  txDispatch(TxEvent.SAFE_APPS_REQUEST, { txId, safeAppRequestId })
}
