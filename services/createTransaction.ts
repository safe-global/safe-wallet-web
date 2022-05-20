import type {
  SafeTransaction,
  SafeTransactionDataPartial,
  TransactionOptions,
  TransactionResult,
} from '@gnosis.pm/safe-core-sdk-types'
import { getSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { erc20Transfer } from './abi'
import { toDecimals } from './formatters'
import { Interface } from '@ethersproject/abi'

const encodeTokenTransferData = (to: string, value: string): string => {
  const contractInterface = new Interface(erc20Transfer)
  return contractInterface.encodeFunctionData('transfer', [to, value])
}

// TODO: move some place else
export const createTokenTransferParams = (
  recipient: string,
  amount: string,
  decimals: number,
  tokenAddress: string,
): SafeTransactionDataPartial => {
  const value = toDecimals(amount, decimals).toFixed()
  const isNativeToken = parseInt(tokenAddress, 16) === 0

  return isNativeToken
    ? {
        to: recipient,
        value,
        data: '0x',
      }
    : {
        to: tokenAddress,
        value: '0x0',
        data: encodeTokenTransferData(recipient, value),
      }
}

export const createTransaction = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  const tx = await safeSdk.createTransaction(txParams)
  return tx
}

export const signTransaction = async (tx: SafeTransaction): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  await safeSdk.signTransaction(tx)
  return tx
}

export const rejectTransaction = async (nonce: number): Promise<SafeTransaction> => {
  const safeSdk = getSafeSDK()
  const tx = await safeSdk.createRejectionTransaction(nonce)
  return tx
}

export const executeTransaction = async (
  tx: SafeTransaction,
  options?: TransactionOptions,
): Promise<TransactionResult> => {
  const safeSdk = getSafeSDK()
  const executeTxResponse = safeSdk.executeTransaction(tx, options)
  return executeTxResponse
}
