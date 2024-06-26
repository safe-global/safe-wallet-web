import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import { assertWalletChain, getSafeSDKWithSigner } from '@/services/tx/tx-sender/sdk'
import { estimateSafeDeploymentGas, estimateTxBaseGas } from '@safe-global/protocol-kit'
import type Safe from '@safe-global/protocol-kit'

import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import {
  getCompatibilityFallbackHandlerContract,
  getSimulateTxAccessorContract,
} from '@safe-global/protocol-kit/dist/src/contracts/safeDeploymentContracts'

import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { useCurrentChain } from '@/hooks/useChains'
import { Safe4337Pack } from '@safe-global/relay-kit'
import { PIMLICO_API_KEY } from '@/config/constants'
import { useAppSelector } from '@/store'
import { selectUndeployedSafe } from '../store/undeployedSafesSlice'
import useSafeAddress from '@/hooks/useSafeAddress'
import type EthSafeOperation from '@safe-global/relay-kit/dist/src/packs/safe-4337/SafeOperation'

const useDeployGasLimit = (safeTx?: SafeTransaction) => {
  const onboard = useOnboard()
  const wallet = useWallet()
  const chainInfo = useCurrentChain()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<EthSafeOperation | undefined>(async () => {
    if (!wallet || !onboard || !chainInfo || !undeployedSafe || !safeTx) return

    const safe4337Pack = await Safe4337Pack.init({
      provider: wallet.provider,
      rpcUrl: chainInfo.publicRpcUri.value,
      bundlerUrl: `https://api.pimlico.io/v1/sepolia/rpc?apikey=${PIMLICO_API_KEY}`,
      options: {
        owners: undeployedSafe.props.safeAccountConfig.owners,
        threshold: undeployedSafe.props.safeAccountConfig.threshold,
        safeVersion: undeployedSafe.props.safeDeploymentConfig?.safeVersion,
        saltNonce: undeployedSafe.props.safeDeploymentConfig?.saltNonce,
      },
    })

    // create user operation
    const safeOperation = await safe4337Pack.createTransaction({
      transactions: [
        {
          data: safeTx.data.data,
          to: safeTx.data.to,
          value: safeTx.data.value,
          operation: safeTx.data.operation,
        },
      ],
    })

    return safe4337Pack.getEstimateFee({
      safeOperation,
    })
  }, [onboard, wallet, chainId, safeTx])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

/**
 * Estimates batch transaction containing the safe deployment and the first transaction.
 *
 * This estimation is done by calling `eth_estimateGas` with a MultiSendCallOnly batch transaction that
 *   1. Calls the SafeProxyFactory to deploy the SafeProxy
 *   2. Call the `simulate` function on the now deployed SafeProxy with the first transaction data.
 * Then we substract a flat gas amount for the overhead of simulating the transaction.
 *
 * Note: To have a more accurate estimation the base gas of a Safe Transaction has to be added to the result
 * @param safeTransaction - first SafeTransaction that should be batched with the deployment
 * @param sdk - predicted Safe instance
 * @param chainId - chainId of the Safe
 * @returns the gas estimation for the batch (as `bigint`)
 */
export const estimateBatchDeploymentTransaction = async (
  safeTransaction: SafeTransaction,
  sdk: Safe,
  chainId: string,
) => {
  const customContracts = sdk.getContractManager().contractNetworks?.[chainId]
  const safeVersion = await sdk.getContractVersion()
  const safeProvider = sdk.getSafeProvider()
  const fallbackHandlerContract = await getCompatibilityFallbackHandlerContract({
    safeProvider,
    safeVersion,
    customContracts,
  })

  const simulateTxAccessorContract = await getSimulateTxAccessorContract({
    safeProvider,
    safeVersion,
    customContracts,
  })

  // 1. Get Deploy tx
  const safeDeploymentTransaction = await sdk.createSafeDeploymentTransaction()
  const safeDeploymentBatchTransaction = {
    to: safeDeploymentTransaction.to,
    value: safeDeploymentTransaction.value,
    data: safeDeploymentTransaction.data,
    operation: OperationType.Call,
  }

  // 2. Add a simulate call to the predicted SafeProxy as second transaction
  const transactionDataToEstimate: string = simulateTxAccessorContract.encode('simulate', [
    safeTransaction.data.to,
    // @ts-ignore
    safeTransaction.data.value,
    safeTransaction.data.data,
    safeTransaction.data.operation,
  ])

  const safeFunctionToEstimate: string = fallbackHandlerContract.encode('simulate', [
    await simulateTxAccessorContract.getAddress(),
    transactionDataToEstimate,
  ])

  const simulateBatchTransaction = {
    to: await sdk.getAddress(),
    value: '0',
    data: safeFunctionToEstimate,
    operation: OperationType.Call,
  }

  const safeDeploymentBatch = await sdk.createTransactionBatch([
    safeDeploymentBatchTransaction,
    simulateBatchTransaction,
  ])

  const signerAddress = await safeProvider.getSignerAddress()

  // estimate the entire batch
  const safeTxGas = await safeProvider.estimateGas({
    ...safeDeploymentBatch,
    from: signerAddress || ZERO_ADDRESS, // This address should not really matter
  })

  // Substract ~20k gas for the simulation overhead
  return BigInt(safeTxGas) - 20_000n
}

export default useDeployGasLimit
