import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import { type BrowserProvider, type Provider } from 'ethers'

import { getSafeInfo, type SafeInfo, type ChainInfo, relayTransaction } from '@safe-global/safe-gateway-typescript-sdk'
import {
  getReadOnlyFallbackHandlerContract,
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
} from '@/services/contracts/safeContracts'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { predictSafeAddress, SafeFactory } from '@safe-global/protocol-kit'
import type Safe from '@safe-global/protocol-kit'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { createEthersAdapter, isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'

import { backOff } from 'exponential-backoff'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

const getSafeFactory = async (
  ethersProvider: BrowserProvider,
  safeVersion = LATEST_SAFE_VERSION,
): Promise<SafeFactory> => {
  if (!isValidSafeVersion(safeVersion)) {
    throw new Error('Invalid Safe version')
  }
  const ethAdapter = await createEthersAdapter(ethersProvider)
  const safeFactory = await SafeFactory.create({ ethAdapter, safeVersion })
  return safeFactory
}

/**
 * Create a Safe creation transaction via Core SDK and submits it to the wallet
 */
export const createNewSafe = async (
  ethersProvider: BrowserProvider,
  props: DeploySafeProps,
  safeVersion?: SafeVersion,
): Promise<Safe> => {
  const safeFactory = await getSafeFactory(ethersProvider, safeVersion)
  return safeFactory.deploySafe(props)
}

/**
 * Compute the new counterfactual Safe address before it is actually created
 */
export const computeNewSafeAddress = async (
  ethersProvider: BrowserProvider,
  props: DeploySafeProps,
  chainId: string,
): Promise<string> => {
  const ethAdapter = await createEthersAdapter(ethersProvider)

  return predictSafeAddress({
    ethAdapter,
    chainId: BigInt(chainId),
    safeAccountConfig: props.safeAccountConfig,
    safeDeploymentConfig: {
      saltNonce: props.saltNonce,
      safeVersion: LATEST_SAFE_VERSION as SafeVersion,
    },
  })
}

/**
 * Encode a Safe creation transaction NOT using the Core SDK because it doesn't support that
 * This is used for gas estimation.
 */
export const encodeSafeCreationTx = async ({
  owners,
  threshold,
  saltNonce,
  chain,
}: SafeCreationProps & { chain: ChainInfo }) => {
  const readOnlySafeContract = await getReadOnlyGnosisSafeContract(chain, LATEST_SAFE_VERSION)
  const readOnlyProxyContract = await getReadOnlyProxyFactoryContract(chain.chainId, LATEST_SAFE_VERSION)
  const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(chain.chainId, LATEST_SAFE_VERSION)

  const setupData = readOnlySafeContract.encode('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    await readOnlyFallbackHandlerContract.getAddress(),
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  return readOnlyProxyContract.encode('createProxyWithNonce', [
    await readOnlySafeContract.getAddress(),
    setupData,
    saltNonce,
  ])
}

export const estimateSafeCreationGas = async (
  chain: ChainInfo,
  provider: Provider,
  from: string,
  safeParams: SafeCreationProps,
): Promise<bigint> => {
  const readOnlyProxyFactoryContract = await getReadOnlyProxyFactoryContract(chain.chainId, LATEST_SAFE_VERSION)
  const encodedSafeCreationTx = await encodeSafeCreationTx({ ...safeParams, chain })

  const gas = await provider.estimateGas({
    from,
    to: await readOnlyProxyFactoryContract.getAddress(),
    data: encodedSafeCreationTx,
  })

  return gas
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
    return { pathname: AppRoutes.home, query: { safe: address } }
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

export const relaySafeCreation = async (
  chain: ChainInfo,
  owners: string[],
  threshold: number,
  saltNonce: number,
  version?: SafeVersion,
) => {
  const safeVersion = version ?? LATEST_SAFE_VERSION

  const readOnlyProxyFactoryContract = await getReadOnlyProxyFactoryContract(chain.chainId, safeVersion)
  const proxyFactoryAddress = await readOnlyProxyFactoryContract.getAddress()
  const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(chain.chainId, safeVersion)
  const fallbackHandlerAddress = await readOnlyFallbackHandlerContract.getAddress()
  const readOnlySafeContract = await getReadOnlyGnosisSafeContract(chain)
  const safeContractAddress = await readOnlySafeContract.getAddress()

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

  const initializer = readOnlySafeContract.encode('setup', [
    callData.owners,
    callData.threshold,
    callData.to,
    callData.data,
    callData.fallbackHandler,
    callData.paymentToken,
    callData.payment,
    callData.paymentReceiver,
  ])

  const createProxyWithNonceCallData = readOnlyProxyFactoryContract.encode('createProxyWithNonce', [
    safeContractAddress,
    initializer,
    saltNonce,
  ])

  const relayResponse = await relayTransaction(chain.chainId, {
    to: proxyFactoryAddress,
    data: createProxyWithNonceCallData,
    version: safeVersion,
  })

  return relayResponse.taskId
}
