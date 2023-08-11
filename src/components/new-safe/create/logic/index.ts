import type { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import { getSafeInfo, type SafeInfo, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import {
  getFallbackHandlerContractDeployment,
  getProxyFactoryContractDeployment,
  getSafeContractDeployment,
} from '@/services/contracts/safeContracts'
import type { ConnectedWallet } from '@/services/onboard'
import { BigNumber } from '@ethersproject/bignumber'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { didRevert, type EthersError } from '@/utils/ethers-utils'
import { Errors, logError } from '@/services/exceptions'
import { ErrorCode } from '@ethersproject/logger'
import { isWalletRejection } from '@/utils/wallets'
import type { PendingSafeTx } from '@/components/new-safe/create/types'
import type { NewSafeFormData } from '@/components/new-safe/create'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import type { AppDispatch, AppThunk } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { SafeFactory } from '@safe-global/safe-core-sdk'
import type Safe from '@safe-global/safe-core-sdk'
import type { DeploySafeProps } from '@safe-global/safe-core-sdk'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import type { PredictSafeProps } from '@safe-global/safe-core-sdk/dist/src/safeFactory'
import { backOff } from 'exponential-backoff'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { formatError } from '@/utils/formatters'
import { sponsoredCall } from '@/services/tx/relaying'
import { Interface } from 'ethers/lib/utils'

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

/**
 * Prepare data for creating a Safe for the Core SDK
 */
export const getSafeDeployProps = (
  safeParams: SafeCreationProps,
  callback: (txHash: string) => void,
  chainId: string,
): PredictSafeProps & { callback: DeploySafeProps['callback'] } => {
  const fallbackHandlerContract = getFallbackHandlerContractDeployment(chainId)

  return {
    safeAccountConfig: {
      threshold: safeParams.threshold,
      owners: safeParams.owners,
      fallbackHandler: fallbackHandlerContract?.networkAddresses[chainId],
    },
    safeDeploymentConfig: {
      saltNonce: safeParams.saltNonce.toString(),
    },
    callback,
  }
}

/**
 * Create a Safe creation transaction via Core SDK and submits it to the wallet
 */
export const createNewSafe = async (ethersProvider: Web3Provider, props: DeploySafeProps): Promise<Safe> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.deploySafe(props)
}

/**
 * Compute the new counterfactual Safe address before it is actually created
 */
export const computeNewSafeAddress = async (ethersProvider: Web3Provider, props: PredictSafeProps): Promise<string> => {
  const ethAdapter = createEthersAdapter(ethersProvider)

  const safeFactory = await SafeFactory.create({ ethAdapter })
  return safeFactory.predictSafeAddress(props)
}

/**
 * Encode a Safe creation transaction NOT using the Core SDK because it doesn't support that
 * This is used for gas estimation.
 */
export const encodeSafeCreationTx = ({
  owners,
  threshold,
  saltNonce,
  chain,
}: SafeCreationProps & { chain: ChainInfo; provider: Web3Provider | JsonRpcProvider }) => {
  const safeContract = getSafeContractDeployment(chain, LATEST_SAFE_VERSION)

  if (!safeContract) {
    throw new Error('No Safe deployment found')
  }

  const proxyFactoryContract = getProxyFactoryContractDeployment(chain.chainId)

  if (!proxyFactoryContract) {
    throw new Error('No ProxyFactory deployment found')
  }

  const fallbackHandlerContract = getFallbackHandlerContractDeployment(chain.chainId)

  if (!fallbackHandlerContract) {
    throw new Error('No FallbackHandler deployment found')
  }

  const safeInterface = new Interface(safeContract.abi)
  const proxyFactoryInterface = new Interface(proxyFactoryContract.abi)

  const setupData = safeInterface.encodeFunctionData('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    fallbackHandlerContract.networkAddresses[chain.chainId],
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  return proxyFactoryInterface.encodeFunctionData('createProxyWithNonce', [
    safeContract.networkAddresses[chain.chainId],
    setupData,
    saltNonce,
  ])
}

/**
 * Encode a Safe creation tx in a way that we can store locally and monitor using _waitForTransaction
 */
export const getSafeCreationTxInfo = async (
  provider: Web3Provider,
  owners: NewSafeFormData['owners'],
  threshold: NewSafeFormData['threshold'],
  saltNonce: NewSafeFormData['saltNonce'],
  chain: ChainInfo,
  wallet: ConnectedWallet,
): Promise<PendingSafeTx> => {
  const proxyFactoryContract = getProxyFactoryContractDeployment(chain.chainId)

  if (!proxyFactoryContract) {
    throw new Error('No ProxyFactory deployment found')
  }

  const data = encodeSafeCreationTx({
    owners: owners.map((owner) => owner.address),
    threshold,
    saltNonce,
    chain,
    provider,
  })

  return {
    data,
    from: wallet.address,
    nonce: await provider.getTransactionCount(wallet.address),
    to: proxyFactoryContract.networkAddresses[chain.chainId],
    value: BigNumber.from(0),
    startBlock: await provider.getBlockNumber(),
  }
}

export const estimateSafeCreationGas = async (
  chain: ChainInfo,
  provider: JsonRpcProvider,
  from: string,
  safeParams: SafeCreationProps,
): Promise<BigNumber> => {
  const proxyFactoryContract = getProxyFactoryContractDeployment(chain.chainId)

  if (!proxyFactoryContract) {
    throw new Error('No ProxyFactory deployment found')
  }

  const encodedSafeCreationTx = encodeSafeCreationTx({ ...safeParams, provider, chain })

  return provider.estimateGas({
    from: from,
    to: proxyFactoryContract.networkAddresses[chain.chainId],
    data: encodedSafeCreationTx,
  })
}

export const pollSafeInfo = async (chainId: string, safeAddress: string): Promise<SafeInfo> => {
  // exponential delay between attempts for around 4 min
  return backOff(() => getSafeInfo(chainId, safeAddress), {
    startingDelay: 750,
    maxDelay: 20000,
    numOfAttempts: 19,
    retry: (e) => {
      console.info('waiting for client-gateway to provide safe information', e)
      return true
    },
  })
}

export const handleSafeCreationError = (error: EthersError) => {
  logError(Errors._800, error.message)

  if (isWalletRejection(error)) {
    return SafeCreationStatus.WALLET_REJECTED
  }

  if (error.code === ErrorCode.TRANSACTION_REPLACED) {
    if (error.reason === 'cancelled') {
      return SafeCreationStatus.ERROR
    } else {
      return SafeCreationStatus.SUCCESS
    }
  }

  if (didRevert(error.receipt)) {
    return SafeCreationStatus.REVERTED
  }

  if (error.code === ErrorCode.TIMEOUT) {
    return SafeCreationStatus.TIMEOUT
  }

  return SafeCreationStatus.ERROR
}

export const SAFE_CREATION_ERROR_KEY = 'create-safe-error'
export const showSafeCreationError = (error: EthersError | Error): AppThunk => {
  return (dispatch) => {
    dispatch(
      showNotification({
        message: `Your transaction was unsuccessful. Reason: ${formatError(error)}`,
        detailedMessage: error.message,
        groupKey: SAFE_CREATION_ERROR_KEY,
        variant: 'error',
      }),
    )
  }
}

export const checkSafeCreationTx = async (
  provider: JsonRpcProvider,
  pendingTx: PendingSafeTx,
  txHash: string,
  dispatch: AppDispatch,
): Promise<SafeCreationStatus> => {
  const TIMEOUT_TIME = 6.5 * 60 * 1000 // 6.5 minutes

  try {
    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME, pendingTx)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (err) {
    const _err = err as EthersError

    const status = handleSafeCreationError(_err)

    if (status !== SafeCreationStatus.SUCCESS) {
      dispatch(showSafeCreationError(_err))
    }

    return status
  }
}

export const CREATION_MODAL_QUERY_PARM = 'showCreationModal'

export const getRedirect = (
  chainPrefix: string,
  safeAddress: string,
  redirectQuery?: string | string[],
): UrlObject | string => {
  const redirectUrl = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery
  const address = `${chainPrefix}:${safeAddress}`

  // Should never happen in practice
  if (!chainPrefix) return AppRoutes.index

  // Go to the dashboard if no specific redirect is provided
  if (!redirectUrl) {
    return { pathname: AppRoutes.home, query: { safe: address, [CREATION_MODAL_QUERY_PARM]: true } }
  }

  // Otherwise, redirect to the provided URL (e.g. from a Safe App)

  // Track the redirect to Safe App
  // TODO: Narrow this down to /apps only
  if (redirectUrl.includes('apps')) {
    trackEvent(SAFE_APPS_EVENTS.SHARED_APP_OPEN_AFTER_SAFE_CREATION)
  }

  // We're prepending the safe address directly here because the `router.push` doesn't parse
  // The URL for already existing query params
  // TODO: Check if we can accomplish this with URLSearchParams or URL instead
  const hasQueryParams = redirectUrl.includes('?')
  const appendChar = hasQueryParams ? '&' : '?'
  return redirectUrl + `${appendChar}safe=${address}`
}

export const relaySafeCreation = async (chain: ChainInfo, owners: string[], threshold: number, saltNonce: number) => {
  const proxyFactoryContract = getProxyFactoryContractDeployment(chain.chainId)

  if (!proxyFactoryContract) {
    throw new Error('No ProxyFactory deployment found')
  }

  const fallbackHandlerContract = getFallbackHandlerContractDeployment(chain.chainId)

  if (!fallbackHandlerContract) {
    throw new Error('No FallbackHandler deployment found')
  }

  const safeContractDeployment = getSafeContractDeployment(chain, LATEST_SAFE_VERSION)

  if (!safeContractDeployment) {
    throw new Error('No Safe contract deployment found')
  }

  const proxyFactoryAddress = proxyFactoryContract.networkAddresses[chain.chainId]
  const fallbackHandlerAddress = fallbackHandlerContract.networkAddresses[chain.chainId]
  const safeContractAddress = safeContractDeployment.networkAddresses[chain.chainId]

  const safeContractInterface = new Interface(safeContractDeployment.abi)
  const proxyFactoryInterface = new Interface(proxyFactoryContract.abi)

  const callData = {
    owners,
    threshold,
    to: ZERO_ADDRESS,
    data: EMPTY_DATA,
    fallbackHandler: fallbackHandlerAddress,
    paymentToken: ZERO_ADDRESS,
    payment: 0,
    paymentReceiver: ZERO_ADDRESS,
  }

  const initializer = safeContractInterface.encodeFunctionData('setup', [
    callData.owners,
    callData.threshold,
    callData.to,
    callData.data,
    callData.fallbackHandler,
    callData.paymentToken,
    callData.payment,
    callData.paymentReceiver,
  ])

  const createProxyWithNonceCallData = proxyFactoryInterface.encodeFunctionData('createProxyWithNonce', [
    safeContractAddress,
    initializer,
    saltNonce,
  ])

  const relayResponse = await sponsoredCall({
    chainId: chain.chainId,
    to: proxyFactoryAddress,
    data: createProxyWithNonceCallData,
  })

  return relayResponse.taskId
}
