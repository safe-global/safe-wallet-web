import type { SafeTransaction, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import { getSafeSDK, getWeb3ReadOnly } from 'utils/web3'
import { erc20Transfer } from './abi'
import { toDecimals } from './formatters'

const encodeTokenTransferData = (to: string, value: string): string => {
  const web3 = getWeb3ReadOnly()
  return web3.eth.abi.encodeFunctionCall(erc20Transfer, [to, value])
}

const createTransaction = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()

  const nonce = await safeSdk.getNonce()

  const transaction: SafeTransactionDataPartial = {
    ...txParams,
    nonce: txParams.nonce ?? nonce,
    data: txParams.data ?? '0x',
  }

  const safeTransaction = await safeSdk.createTransaction(transaction)

  console.log('Created tx', safeTransaction)

  return safeTransaction
}

export const createTokenTransferTx = async (
  recepient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): Promise<SafeTransaction> => {
  const value = toDecimals(amount, decimals)
  const isNativeToken = parseInt(tokenAddress, 16) === 0

  const txParams = isNativeToken
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

  return await createTransaction(txParams)
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
