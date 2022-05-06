import type { SafeTransaction, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import Web3 from 'web3'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { erc20Transfer } from './abi'
import { toDecimals } from './formatters'

const encodeTokenTransferData = (to: string, value: string): string => {
  return new Web3().eth.abi.encodeFunctionCall(erc20Transfer, [to, value])
}

export const createTokenTransferParams = (
  recepient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): SafeTransactionDataPartial => {
  const value = toDecimals(amount, decimals).toFixed()
  const isNativeToken = parseInt(tokenAddress, 16) === 0

  return isNativeToken
    ? {
        to: recepient,
        value,
        data: '0x',
      }
    : {
        to: tokenAddress,
        value: '0x0',
        data: encodeTokenTransferData(recepient, value),
      }
}

export const createTransaction = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  const tx = await safeSdk.createTransaction(txParams)

  console.log('Created tx', tx)

  return tx
}

export const signTransaction = async (tx: SafeTransaction): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  await safeSdk.signTransaction(tx)

  console.log('Signed tx', tx)

  return tx
}

export const rejectTransaction = async (nonce: number): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  const tx = await safeSdk.createRejectionTransaction(nonce)

  console.log('Reject tx', tx)

  return tx
}

export const executeTransaction = async (tx: SafeTransaction) => {
  const safeSdk = getSafeSDK()
  const executeTxResponse = await safeSdk.executeTransaction(tx)
  return await executeTxResponse.transactionResponse?.wait()
}
