import type { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import type Safe from '@gnosis.pm/safe-core-sdk'
import { SafeFactory, type DeploySafeProps } from '@gnosis.pm/safe-core-sdk'
import { createEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import type { ChainInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  getProxyFactoryContractInstance,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import type { PredictSafeProps } from '@gnosis.pm/safe-core-sdk/dist/src/safeFactory'
import type { ConnectedWallet } from '@/services/onboard'
import { BigNumber } from '@ethersproject/bignumber'
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { backOff } from 'exponential-backoff'
import { SafeCreationStatus } from '@/components/new-safe/steps/Step4/useSafeCreation'
import { didRevert, type EthersError } from '@/utils/ethers-utils'
import { Errors, logError } from '@/services/exceptions'
import { ErrorCode } from '@ethersproject/logger'
import { isWalletRejection } from '@/utils/wallets'
import type { PendingSafeTx } from '@/components/create-safe/types'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { UrlObject } from 'url'
import chains from '@/config/chains'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'

/**
 * Prepare data for creating a Safe for the Core SDK
 */
export const getSafeDeployProps = (
  safeParams: SafeCreationProps,
  callback: (txHash: string) => void,
  chainId: string,
): PredictSafeProps & { callback: DeploySafeProps['callback'] } => {
  const fallbackHandler = getFallbackHandlerContractInstance(chainId)

  return {
    safeAccountConfig: {
      threshold: safeParams.threshold,
      owners: safeParams.owners,
      fallbackHandler: fallbackHandler.address,
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
}: SafeCreationProps & { chain: ChainInfo }) => {
  const safeContract = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)
  const fallbackHandlerContract = getFallbackHandlerContractInstance(chain.chainId)

  const setupData = safeContract.encode('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    fallbackHandlerContract.address,
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  return proxyContract.encode('createProxyWithNonce', [safeContract.getAddress(), setupData, saltNonce])
}

/**
 * Encode a Safe creation tx in a way that we can store locally and monitor using _waitForTransaction
 */
export const getSafeCreationTxInfo = async (
  provider: Web3Provider,
  params: NewSafeFormData,
  chain: ChainInfo,
  saltNonce: number,
  wallet: ConnectedWallet,
): Promise<PendingSafeTx> => {
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)

  const data = encodeSafeCreationTx({
    owners: params.owners.map((owner) => owner.address),
    threshold: params.threshold,
    saltNonce,
    chain,
  })

  return {
    data,
    from: wallet.address,
    nonce: await provider.getTransactionCount(wallet.address),
    to: proxyContract.getAddress(),
    value: BigNumber.from(0),
    startBlock: await provider.getBlockNumber(),
  }
}

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

export const estimateSafeCreationGas = async (
  chain: ChainInfo,
  provider: JsonRpcProvider,
  from: string,
  safeParams: SafeCreationProps,
): Promise<BigNumber> => {
  const proxyFactoryContract = getProxyFactoryContractInstance(chain.chainId)
  const encodedSafeCreationTx = encodeSafeCreationTx({ ...safeParams, chain })

  return provider.estimateGas({
    from: from,
    to: proxyFactoryContract.getAddress(),
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

  return SafeCreationStatus.TIMEOUT
}

export const checkSafeCreationTx = async (
  provider: JsonRpcProvider,
  pendingTx: PendingSafeTx,
  txHash: string,
): Promise<SafeCreationStatus> => {
  const TIMEOUT_TIME = 6.5 * 60 * 1000 // 6.5 minutes

  try {
    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME, pendingTx)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (err) {
    return handleSafeCreationError(err as EthersError)
  }
}

export const getRedirect = (
  chainId: string,
  safeAddress: string,
  redirectQuery?: string | string[],
): UrlObject | string => {
  const redirectUrl = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery
  const chainPrefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  const address = `${chainPrefix}:${safeAddress}`

  // Should never happen in practice
  if (!chainPrefix) return AppRoutes.index

  // Go to the dashboard if no specific redirect is provided
  if (!redirectUrl) {
    return { pathname: AppRoutes.home, query: { safe: address, showCreationModal: true } }
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
