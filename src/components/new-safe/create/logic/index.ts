import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import { Interface, type Eip1193Provider, type Provider } from 'ethers'

import { getSafeInfo, type SafeInfo, type ChainInfo, relayTransaction } from '@safe-global/safe-gateway-typescript-sdk'
import {
  getReadOnlyFallbackHandlerContract,
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
} from '@/services/contracts/safeContracts'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { predictSafeAddress, SafeFactory, SafeProvider } from '@safe-global/protocol-kit'
import type Safe from '@safe-global/protocol-kit'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { isValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'

import { backOff } from 'exponential-backoff'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { getLatestSafeVersion } from '@/utils/chains'
import { getSafeL2SingletonDeployment } from '@safe-global/safe-deployments'
import { ECOSYSTEM_ID_ADDRESS } from '@/config/constants'

export type SafeCreationProps = {
  owners: string[]
  threshold: number
  saltNonce: number
}

const getSafeFactory = async (
  provider: Eip1193Provider,
  safeVersion: SafeVersion,
  isL1SafeSingleton?: boolean,
): Promise<SafeFactory> => {
  if (!isValidSafeVersion(safeVersion)) {
    throw new Error('Invalid Safe version')
  }
  return SafeFactory.init({ provider, safeVersion, isL1SafeSingleton })
}

/**
 * Create a Safe creation transaction via Core SDK and submits it to the wallet
 */
export const createNewSafe = async (
  provider: Eip1193Provider,
  props: DeploySafeProps,
  safeVersion: SafeVersion,
  isL1SafeSingleton?: boolean,
): Promise<Safe> => {
  const safeFactory = await getSafeFactory(provider, safeVersion, isL1SafeSingleton)
  return safeFactory.deploySafe(props)
}

/**
 * Compute the new counterfactual Safe address before it is actually created
 */
export const computeNewSafeAddress = async (
  provider: Eip1193Provider,
  props: DeploySafeProps,
  chain: ChainInfo,
  safeVersion?: SafeVersion,
): Promise<string> => {
  const safeProvider = new SafeProvider({ provider })

  return predictSafeAddress({
    safeProvider,
    chainId: BigInt(chain.chainId),
    safeAccountConfig: props.safeAccountConfig,
    safeDeploymentConfig: {
      saltNonce: props.saltNonce,
      safeVersion: safeVersion ?? getLatestSafeVersion(chain),
    },
    isL1SafeSingleton: true,
  })
}

export const SAFE_TO_L2_SETUP_ADDRESS = '0x80E0d1577aD3d982BF2F49aAB00BfA161AA763c4'
export const SAFE_TO_L2_SETUP_INTERFACE = new Interface(['function setupToL2(address l2Singleton)'])

/**
 * Encode a Safe creation transaction NOT using the Core SDK because it doesn't support that
 * This is used for gas estimation.
 */
export const encodeSafeCreationTx = async ({
  owners,
  threshold,
  saltNonce,
  chain,
  safeVersion,
}: SafeCreationProps & { chain: ChainInfo; safeVersion?: SafeVersion; to?: string; data?: string }) => {
  const usedSafeVersion = safeVersion ?? getLatestSafeVersion(chain)
  const readOnlyL1SafeContract = await getReadOnlyGnosisSafeContract(chain, usedSafeVersion, true)
  const l2Deployment = getSafeL2SingletonDeployment({ version: safeVersion, network: chain.chainId })
  const readOnlyProxyContract = await getReadOnlyProxyFactoryContract(usedSafeVersion)
  const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(usedSafeVersion)

  const callData = {
    owners,
    threshold,
    to: SAFE_TO_L2_SETUP_ADDRESS,
    data: SAFE_TO_L2_SETUP_INTERFACE.encodeFunctionData('setupToL2', [l2Deployment?.defaultAddress]),
    fallbackHandler: await readOnlyFallbackHandlerContract.getAddress(),
    paymentToken: ZERO_ADDRESS,
    payment: 0,
    paymentReceiver: ECOSYSTEM_ID_ADDRESS,
  }

  // @ts-ignore union type is too complex
  const setupData = readOnlySafeContract.encode('setup', [
    callData.owners,
    callData.threshold,
    callData.to,
    callData.data,
    callData.fallbackHandler,
    callData.paymentToken,
    callData.payment,
    callData.paymentReceiver,
  ])

  return readOnlyProxyContract.encode('createProxyWithNonce', [
    await readOnlyL1SafeContract.getAddress(), // always L1 Mastercopy
    setupData,
    BigInt(saltNonce),
  ])
}

export const estimateSafeCreationGas = async (
  chain: ChainInfo,
  provider: Provider,
  from: string,
  safeParams: SafeCreationProps,
  safeVersion?: SafeVersion,
): Promise<bigint> => {
  const readOnlyProxyFactoryContract = await getReadOnlyProxyFactoryContract(safeVersion ?? getLatestSafeVersion(chain))
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
  const latestSafeVersion = getLatestSafeVersion(chain)

  const safeVersion = version ?? latestSafeVersion

  const readOnlyProxyFactoryContract = await getReadOnlyProxyFactoryContract(safeVersion)
  const proxyFactoryAddress = await readOnlyProxyFactoryContract.getAddress()
  const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(safeVersion)
  const fallbackHandlerAddress = await readOnlyFallbackHandlerContract.getAddress()
  const readOnlyL1SafeContract = await getReadOnlyGnosisSafeContract(chain, safeVersion, true)
  const safeContractAddress = await readOnlyL1SafeContract.getAddress()
  const l2Deployment = getSafeL2SingletonDeployment({ version: safeVersion, network: chain.chainId })

  const callData = {
    owners,
    threshold,
    to: SAFE_TO_L2_SETUP_ADDRESS,
    data: SAFE_TO_L2_SETUP_INTERFACE.encodeFunctionData('setupToL2', [l2Deployment?.defaultAddress]),
    fallbackHandler: fallbackHandlerAddress,
    paymentToken: ZERO_ADDRESS,
    payment: 0,
    paymentReceiver: ECOSYSTEM_ID_ADDRESS,
  }

  // @ts-ignore
  const initializer = readOnlyL1SafeContract.encode('setup', [
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
    BigInt(saltNonce),
  ])

  const relayResponse = await relayTransaction(chain.chainId, {
    to: proxyFactoryAddress,
    data: createProxyWithNonceCallData,
    version: safeVersion,
  })

  return relayResponse.taskId
}
