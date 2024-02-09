import { LATEST_SAFE_VERSION } from '@/config/constants'
import type { NewSafeFormData } from '@/components/new-safe/create'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { asError } from '@/services/exceptions/utils'
import { assertWalletChain, getUncheckedSafeSDK } from '@/services/tx/tx-sender/sdk'
import { AppRoutes } from '@/config/routes'
import { addUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import type { AppDispatch } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import { didReprice, didRevert, type EthersError } from '@/utils/ethers-utils'
import { assertOnboard, assertTx, assertWallet } from '@/utils/helpers'
import type { DeploySafeProps, PredictedSafeProps } from '@safe-global/protocol-kit'
import type { SafeTransaction, TransactionOptions } from '@safe-global/safe-core-sdk-types'
import type { OnboardAPI } from '@web3-onboard/core'
import type { ContractTransactionResponse } from 'ethers'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import {
  type ChainInfo,
  ImplementationVersionState,
  type SafeBalanceResponse,
  TokenType,
  type SafeInfo,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { BrowserProvider } from 'ethers'
import { createWeb3 } from '@/hooks/wallets/web3'
import type { NextRouter } from 'next/router'

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
  onSuccess?: () => void,
) => {
  const sdkUnchecked = await getUncheckedSafeSDK(onboard, chainId)
  const eventParams = { groupKey: 'cf-tx' }
  const safeAddress = await sdkUnchecked.getAddress()

  let result: ContractTransactionResponse | undefined
  try {
    const signedTx = await sdkUnchecked.signTransaction(safeTx)

    const wallet = await assertWalletChain(onboard, chainId)
    const provider = createWeb3(wallet.provider)
    const signer = await provider.getSigner()

    const deploymentTx = await sdkUnchecked.wrapSafeTransactionIntoDeploymentBatch(signedTx, txOptions)

    // @ts-ignore TODO: Check why TransactionResponse type doesn't work
    result = await signer.sendTransaction(deploymentTx)
    txDispatch(TxEvent.EXECUTING, eventParams)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { ...eventParams, error: asError(error) })
    throw error
  }

  txDispatch(TxEvent.PROCESSING, { ...eventParams, txHash: result!.hash })

  result
    ?.wait()
    .then((receipt) => {
      if (receipt === null) {
        txDispatch(TxEvent.FAILED, { ...eventParams, error: new Error('No transaction receipt found') })
      } else if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { ...eventParams, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { ...eventParams, safeAddress })
      }
    })
    .catch((err) => {
      const error = err as EthersError

      if (didReprice(error)) {
        txDispatch(TxEvent.PROCESSED, { ...eventParams, safeAddress })
      } else {
        txDispatch(TxEvent.FAILED, { ...eventParams, error: asError(error) })
      }
    })
    .finally(() => {
      onSuccess?.()
    })

  return result!.hash
}

export const deploySafeAndExecuteTx = async (
  txOptions: TransactionOptions,
  chainId: string,
  wallet: ConnectedWallet | null,
  safeTx?: SafeTransaction,
  onboard?: OnboardAPI,
  onSuccess?: () => void,
) => {
  assertTx(safeTx)
  assertWallet(wallet)
  assertOnboard(onboard)

  return dispatchTxExecutionAndDeploySafe(safeTx, txOptions, onboard, chainId, onSuccess)
}

export const getCounterfactualBalance = async (safeAddress: string, provider?: BrowserProvider, chain?: ChainInfo) => {
  const balance = await provider?.getBalance(safeAddress)

  if (balance === undefined || !chain) return

  return <SafeBalanceResponse>{
    fiatTotal: '0',
    items: [
      {
        tokenInfo: {
          type: TokenType.NATIVE_TOKEN,
          address: ZERO_ADDRESS,
          ...chain?.nativeCurrency,
        },
        balance: balance.toString(),
        fiatBalance: '0',
        fiatConversion: '0',
      },
    ],
  }
}

export const createCounterfactualSafe = (
  chain: ChainInfo,
  safeAddress: string,
  saltNonce: string,
  data: NewSafeFormData,
  dispatch: AppDispatch,
  props: DeploySafeProps,
  router: NextRouter,
) => {
  const undeployedSafe = {
    chainId: chain.chainId,
    address: safeAddress,
    safeProps: {
      safeAccountConfig: props.safeAccountConfig,
      safeDeploymentConfig: {
        saltNonce,
        safeVersion: LATEST_SAFE_VERSION as SafeVersion,
      },
    },
  }

  dispatch(addUndeployedSafe(undeployedSafe))
  dispatch(upsertAddressBookEntry({ chainId: chain.chainId, address: safeAddress, name: data.name }))
  dispatch(
    addOrUpdateSafe({
      safe: {
        ...defaultSafeInfo,
        address: { value: safeAddress, name: data.name },
        threshold: data.threshold,
        owners: data.owners.map((owner) => ({
          value: owner.address,
          name: owner.name || owner.ens,
        })),
        chainId: chain.chainId,
      },
    }),
  )
  router.push({ pathname: AppRoutes.home, query: { safe: `${chain.shortName}:${safeAddress}` } })
}
