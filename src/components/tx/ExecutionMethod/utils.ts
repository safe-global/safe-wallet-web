import { getSpecificGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import { dispatchTxSigning } from '@/services/tx/tx-sender'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const prepareRelayTxData = async (
  createdTx: SafeTransaction,
  safe: SafeInfo,
  proposeCallback: (tx: SafeTransaction) => Promise<string>,
) => {
  let transactionToRelay = createdTx
  let txId: string | undefined

  // Add missing signature
  if (createdTx.signatures.size < safe.threshold) {
    const signedTransaction = await dispatchTxSigning(createdTx, safe.version)

    if (!signedTransaction) {
      throw new Error('Could not sign transaction')
    }

    txId = await proposeCallback(signedTransaction)
    transactionToRelay = signedTransaction
  }

  const instance = getSpecificGnosisSafeContractInstance(safe)

  const data = instance.encode('execTransaction', [
    transactionToRelay.data.to,
    transactionToRelay.data.value,
    transactionToRelay.data.data,
    transactionToRelay.data.operation,
    transactionToRelay.data.safeTxGas,
    transactionToRelay.data.baseGas,
    transactionToRelay.data.gasPrice,
    transactionToRelay.data.gasToken,
    transactionToRelay.data.refundReceiver,
    transactionToRelay.encodedSignatures(),
  ])

  return { data, txId }
}
