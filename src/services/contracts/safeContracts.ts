import {
  getFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  getSignMessageLibDeployment,
  type SingletonDeployment,
} from '@safe-global/safe-deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import semverSatisfies from 'semver/functions/satisfies'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import { assertValidSafeVersion, createEthersAdapter, createReadOnlyEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import type SignMessageLibEthersContract from '@safe-global/safe-ethers-lib/dist/src/contracts/SignMessageLib/SignMessageLibEthersContract'
import type CompatibilityFallbackHandlerEthersContract from '@safe-global/safe-ethers-lib/dist/src/contracts/CompatibilityFallbackHandler/CompatibilityFallbackHandlerEthersContract'
import type { Web3Provider } from '@ethersproject/providers'
import type GnosisSafeContractEthers from '@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers'
import type EthersAdapter from '@safe-global/safe-ethers-lib'

// `UNKNOWN` is returned if the mastercopy does not match supported ones
// @see https://github.com/safe-global/safe-client-gateway/blob/main/src/routes/safes/handlers/safes.rs#L28-L31
//      https://github.com/safe-global/safe-client-gateway/blob/main/src/routes/safes/converters.rs#L77-L79
export const isValidMasterCopy = (implementationVersionState: SafeInfo['implementationVersionState']): boolean => {
  return implementationVersionState !== ImplementationVersionState.UNKNOWN
}

export const shouldPinDeploymentVersion = (safeVersion: SafeInfo['version']): boolean => {
  return !!safeVersion && semverSatisfies(safeVersion, `>${LATEST_SAFE_VERSION}`)
}

// Pins version to LATEST_SAFE_VERSION until we officially update to new safe-deployments
// @see https://github.com/safe-global/safe-deployments/pull/248
export const getPinnedDeploymentVersion = (safeVersion: SafeInfo['version']): string => {
  const PINNED_VERSION = LATEST_SAFE_VERSION

  if (!safeVersion) {
    return PINNED_VERSION
  }

  // Remove '+L2'/'+Circles' metadata from version
  // SDK request here: https://github.com/safe-global/safe-core-sdk/issues/261
  const [noMetadataVersion] = safeVersion.split('+')

  const version = shouldPinDeploymentVersion(safeVersion) ? PINNED_VERSION : noMetadataVersion

  // Assert SDK support
  assertValidSafeVersion(version)

  return version
}

// GnosisSafe

const getGnosisSafeContractEthers = (safe: SafeInfo, ethAdapter: EthersAdapter): GnosisSafeContractEthers => {
  const customContractAddress = shouldPinDeploymentVersion(safe.version) ? undefined : safe.address.value
  const pinnedVersion = getPinnedDeploymentVersion(safe.version)

  return ethAdapter.getSafeContract({
    customContractAddress,
    chainId: +safe.chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

export const getReadOnlyCurrentGnosisSafeContract = (safe: SafeInfo): GnosisSafeContractEthers => {
  const ethAdapter = createReadOnlyEthersAdapter()
  return getGnosisSafeContractEthers(safe, ethAdapter)
}

export const getCurrentGnosisSafeContract = (safe: SafeInfo, provider: Web3Provider): GnosisSafeContractEthers => {
  const ethAdapter = createEthersAdapter(provider)
  return getGnosisSafeContractEthers(safe, ethAdapter)
}

const isOldestVersion = (safeVersion: string): boolean => {
  return !!safeVersion && semverSatisfies(safeVersion, '<=1.0.0')
}

export const getSafeContractDeployment = (chain: ChainInfo, safeVersion: string): SingletonDeployment | undefined => {
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  // We check if version is prior to v1.0.0 as they are not supported but still we want to keep a minimum compatibility
  const useOldestContractVersion = isOldestVersion(pinnedVersion)

  // We had L1 contracts in three L2 networks, xDai, EWC and Volta so even if network is L2 we have to check that safe version is after v1.3.0
  const useL2ContractVersion = chain.l2 && semverSatisfies(pinnedVersion, '>=1.3.0')
  const getDeployment = useL2ContractVersion ? getSafeL2SingletonDeployment : getSafeSingletonDeployment

  return (
    getDeployment({
      version: pinnedVersion,
      network: chain.chainId,
    }) ||
    getDeployment({ version: pinnedVersion }) ||
    // In case we couldn't find a valid deployment and it's a version before 1.0.0 we return v1.0.0 to allow a minimum compatibility
    (useOldestContractVersion
      ? getDeployment({
          version: '1.0.0',
        })
      : undefined)
  )
}

export const getReadOnlyGnosisSafeContract = (chain: ChainInfo, safeVersion: string = LATEST_SAFE_VERSION) => {
  const ethAdapter = createReadOnlyEthersAdapter()
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getSafeContract({
    singletonDeployment: getSafeContractDeployment(chain, pinnedVersion),
    chainId: +chain.chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

// MultiSend

export const getMultiSendCallOnlyContractDeployment = (
  chainId: string,
  safeVersion: SafeInfo['version'] = LATEST_SAFE_VERSION,
) => {
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return (
    getMultiSendCallOnlyDeployment({ version: pinnedVersion, network: chainId }) ||
    getMultiSendCallOnlyDeployment({ version: pinnedVersion })
  )
}

export const getMultiSendCallOnlyContract = (
  chainId: string,
  safeVersion: SafeInfo['version'],
  provider: Web3Provider,
) => {
  const ethAdapter = createEthersAdapter(provider)
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getMultiSendCallOnlyContract({
    singletonDeployment: getMultiSendCallOnlyContractDeployment(chainId, pinnedVersion),
    chainId: +chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

export const getReadOnlyMultiSendCallOnlyContract = (
  chainId: string,
  safeVersion: SafeInfo['version'] = LATEST_SAFE_VERSION,
) => {
  const ethAdapter = createReadOnlyEthersAdapter()
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getMultiSendCallOnlyContract({
    singletonDeployment: getMultiSendCallOnlyContractDeployment(chainId, pinnedVersion),
    chainId: +chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

// GnosisSafeProxyFactory

export const getProxyFactoryContractDeployment = (chainId: string, safeVersion: string) => {
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return (
    getProxyFactoryDeployment({ version: pinnedVersion, network: chainId }) ||
    getProxyFactoryDeployment({ version: pinnedVersion })
  )
}

export const getReadOnlyProxyFactoryContract = (chainId: string, safeVersion: string = LATEST_SAFE_VERSION) => {
  const ethAdapter = createReadOnlyEthersAdapter()
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getSafeProxyFactoryContract({
    singletonDeployment: getProxyFactoryContractDeployment(chainId, pinnedVersion),
    chainId: +chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

// Fallback handler

export const getFallbackHandlerContractDeployment = (
  chainId: string,
  safeVersion: SafeInfo['version'] = LATEST_SAFE_VERSION,
) => {
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return (
    getFallbackHandlerDeployment({ version: pinnedVersion, network: chainId }) ||
    getFallbackHandlerDeployment({ version: pinnedVersion })
  )
}

export const getReadOnlyFallbackHandlerContract = (
  chainId: string,
  safeVersion: string = LATEST_SAFE_VERSION,
): CompatibilityFallbackHandlerEthersContract => {
  const ethAdapter = createReadOnlyEthersAdapter()
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getCompatibilityFallbackHandlerContract({
    singletonDeployment: getFallbackHandlerContractDeployment(chainId, pinnedVersion),
    chainId: +chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}

// Sign messages deployment
export const getSignMessageLibContractDeployment = (chainId: string, safeVersion: string) => {
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return (
    getSignMessageLibDeployment({ network: chainId, version: pinnedVersion }) ||
    getSignMessageLibDeployment({ version: pinnedVersion })
  )
}

export const getReadOnlySignMessageLibContract = (
  chainId: string,
  safeVersion: SafeInfo['version'] = LATEST_SAFE_VERSION,
): SignMessageLibEthersContract => {
  const ethAdapter = createReadOnlyEthersAdapter()
  const pinnedVersion = getPinnedDeploymentVersion(safeVersion)

  return ethAdapter.getSignMessageLibContract({
    singletonDeployment: getSignMessageLibContractDeployment(chainId, pinnedVersion),
    chainId: +chainId,
    safeVersion: pinnedVersion as SafeVersion,
  })
}
