import type { SafeTransaction, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import { getSafeSDK } from 'utils/web3'

export type NewTxData = {
  to: string
  value: string
  data?: string
  nonce?: number
}

export const createTransaction = async (txData: NewTxData): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()

  // TODO: Get these values from a form
  const nonce = await safeSdk.getNonce()

  const transaction: SafeTransactionDataPartial = {
    nonce, // can be overwritten by txData, so should go first
    data: '0x', // same
    ...txData,
  }

  const safeTransaction = await safeSdk.createTransaction(transaction)

  console.log('Created tx', safeTransaction)

  return safeTransaction
}

export const signTransaction = async (tx: SafeTransaction): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()

  await safeSdk.signTransaction(tx)

  console.log('Signed tx', tx)

  return tx
}

export const executeTransaction = async (tx: SafeTransaction) => {
  const safeSdk = getSafeSDK()
  const executeTxResponse = await safeSdk.executeTransaction(tx)
  return await executeTxResponse.transactionResponse?.wait()
}
