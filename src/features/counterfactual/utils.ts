import { LATEST_SAFE_VERSION } from '@/config/constants'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { assertWalletChain, getUncheckedSafeSDK } from '@/services/tx/tx-sender/sdk'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import { assertOnboard, assertTx, assertWallet } from '@/utils/helpers'
import type { DeploySafeProps, PredictedSafeProps } from '@safe-global/protocol-kit'
import type { SafeTransaction, TransactionOptions } from '@safe-global/safe-core-sdk-types'
import { ImplementationVersionState, type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { OnboardAPI } from '@web3-onboard/core'
import type { ContractTransactionResponse } from 'ethers'
import type { BrowserProvider } from 'ethers'
import { computeNewSafeAddress } from '@/components/new-safe/create/logic'
import { createWeb3, isSmartContract } from '@/hooks/wallets/web3'

export const getCounterfactualNonce = async (
  provider: BrowserProvider,
  props: DeploySafeProps,
): Promise<string | undefined> => {
  const safeAddress = await computeNewSafeAddress(provider, props)
  const isContractDeployed = await isSmartContract(provider, safeAddress)

  // Safe is already deployed so we try the next saltNonce
  if (isContractDeployed) {
    return getCounterfactualNonce(provider, { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() })
  }

  return props.saltNonce
}

export const getUndeployedSafeInfo = (undeployedSafe: PredictedSafeProps, address: string, chainId: string) => {
  return Promise.resolve({
    ...defaultSafeInfo,
    address: { value: address },
    chainId,
    owners: undeployedSafe.safeAccountConfig.owners.map((owner) => ({ value: owner })),
    nonce: 0,
    threshold: undeployedSafe.safeAccountConfig.threshold,
    implementationVersionState: ImplementationVersionState.UP_TO_DATE,
    fallbackHandler: { value: undeployedSafe.safeAccountConfig.fallbackHandler! },
    version: LATEST_SAFE_VERSION,
    deployed: false,
  })
}

export const dispatchTxExecutionAndDeploySafe = async (
  safeTx: SafeTransaction,
  txOptions: TransactionOptions,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
) => {
  const sdkUnchecked = await getUncheckedSafeSDK(onboard, chainId)

  let result: ContractTransactionResponse | undefined
  try {
    const wallet = await assertWalletChain(onboard, chainId)

    const signedTx = await sdkUnchecked.signTransaction(safeTx)
    const deploymentTx = await sdkUnchecked.wrapSafeTransactionIntoDeploymentBatch(signedTx, txOptions)

    const provider = createWeb3(wallet.provider)
    const signer = await provider.getSigner()

    // @ts-ignore TODO: Check if the other type also works
    result = await signer.sendTransaction(deploymentTx)
  } catch (e) {
    // TODO: Dispatch tx event?
    console.log(e)
    throw e
  }

  return result?.wait()
}

export const deploySafeAndExecuteTx = async (
  txOptions: TransactionOptions,
  chainId: string,
  wallet: ConnectedWallet | null,
  safeTx?: SafeTransaction,
  onboard?: OnboardAPI,
) => {
  assertTx(safeTx)
  assertWallet(wallet)
  assertOnboard(onboard)

  return dispatchTxExecutionAndDeploySafe(safeTx, txOptions, onboard, chainId)
}
