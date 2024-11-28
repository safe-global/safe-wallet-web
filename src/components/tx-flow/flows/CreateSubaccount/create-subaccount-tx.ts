import { OperationType } from '@safe-global/safe-core-sdk-types'
import Safe from '@safe-global/protocol-kit'
import type { Eip1193Provider } from 'ethers'
import type { MetaTransactionData, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeAccountConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit'

import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { SetupSubaccountFormAssetFields } from '@/components/tx-flow/flows/CreateSubaccount/SetupSubaccount'
import type {
  SetupSubaccountForm,
  SetupSubaccountFormFields,
} from '@/components/tx-flow/flows/CreateSubaccount/SetupSubaccount'

/**
 * Creates a (batch) transaction to deploy (and fund) a Subaccount.
 *
 * Note: Subaccounts are owned by provided {@link currentSafeAddress}, with a threshold of 1.
 *
 * @param {Eip1193Provider} args.provider - EIP-1193 provider
 * @param {SetupSubaccountForm['assets']} args.assets - assets to fund the Subaccount with
 * @param {SafeAccountConfig} args.safeAccountConfig - Subaccount configuration
 * @param {SafeDeploymentConfig} args.safeDeploymentConfig - Subaccount deployment configuration
 * @param {string} args.predictedSafeAddress - predicted Subaccount address
 * @param {SafeBalanceResponse} args.balances - current Safe balance
 *
 * @returns {Promise<SafeTransaction>} (batch) transaction to deploy (and fund) Subaccount
 */
export async function createSubaccount(args: {
  provider: Eip1193Provider
  assets: SetupSubaccountForm[SetupSubaccountFormFields.assets]
  safeAccountConfig: SafeAccountConfig
  safeDeploymentConfig: SafeDeploymentConfig
  predictedSafeAddress: string
  balances: SafeBalanceResponse
}): Promise<SafeTransaction> {
  const deploymentTransaction = await getDeploymentTransaction(args)
  const fundingTransactions = getFundingTransactions(args)
  if (fundingTransactions.length === 0) {
    return createTx(deploymentTransaction)
  }
  return createMultiSendCallOnlyTx([deploymentTransaction, ...fundingTransactions])
}

/**
 * Creates a transaction to deploy a Subaccount.
 *
 * @param {Eip1193Provider} args.provider - EIP-1193 provider
 * @param {SafeAccountConfig} args.safeAccountConfig - Subaccount configuration
 * @param {SafeDeploymentConfig} args.safeDeploymentConfig - Subaccount deployment configuration
 *
 * @returns {Promise<MetaTransactionData>} Safe deployment transaction
 */
async function getDeploymentTransaction(args: {
  provider: Eip1193Provider
  safeAccountConfig: SafeAccountConfig
  safeDeploymentConfig: SafeDeploymentConfig
}): Promise<MetaTransactionData> {
  const sdk = await Safe.init({
    provider: args.provider,
    predictedSafe: {
      safeAccountConfig: args.safeAccountConfig,
      safeDeploymentConfig: args.safeDeploymentConfig,
    },
  })
  return sdk.createSafeDeploymentTransaction().then(({ to, value, data }) => {
    return {
      to,
      value,
      data,
      operation: OperationType.Call,
    }
  })
}

/**
 * Creates a list of transfer transactions (to fund a Subaccount).
 *
 * @param {SetupSubaccountForm['assets']} args.assets - assets to fund the Subaccount
 * @param {SafeBalanceResponse} args.balances - current Safe balances
 * @param {string} args.predictedSafeAddress - predicted Subaccount address
 *
 * @returns {Array<MetaTransactionData>} list of transfer transactions
 */
function getFundingTransactions(args: {
  assets: SetupSubaccountForm[SetupSubaccountFormFields.assets]
  balances: SafeBalanceResponse
  predictedSafeAddress: string
}): Array<MetaTransactionData> {
  if (args.assets.length === 0) {
    return []
  }
  return args.assets
    .map((asset) => {
      const token = args.balances.items.find((item) => {
        return item.tokenInfo.address === asset[SetupSubaccountFormAssetFields.tokenAddress]
      })
      if (token) {
        return createTokenTransferParams(
          args.predictedSafeAddress,
          asset[SetupSubaccountFormAssetFields.amount],
          token.tokenInfo.decimals,
          token.tokenInfo.address,
        )
      }
    })
    .filter(<T>(x: T): x is NonNullable<T> => {
      return x != null
    })
}
