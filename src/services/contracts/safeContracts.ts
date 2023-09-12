import {
  getFallbackHandlerContractDeployment,
  getMultiSendCallOnlyContractDeployment,
  getProxyFactoryContractDeployment,
  getSafeContractDeployment,
  getSignMessageLibContractDeployment,
} from './deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { GetContractProps, SafeVersion } from '@safe-global/safe-core-sdk-types'
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

export const _getValidatedGetContractProps = (
  chainId: string,
  safeVersion: SafeInfo['version'],
): Pick<GetContractProps, 'chainId' | 'safeVersion'> => {
  assertValidSafeVersion(safeVersion)

  // SDK request here: https://github.com/safe-global/safe-core-sdk/issues/261
  // Remove '+L2'/'+Circles' metadata from version
  const [noMetadataVersion] = safeVersion.split('+')

  return {
    chainId: +chainId,
    safeVersion: noMetadataVersion as SafeVersion,
  }
}

// GnosisSafe

const getGnosisSafeContractEthers = (safe: SafeInfo, ethAdapter: EthersAdapter): GnosisSafeContractEthers => {
  return ethAdapter.getSafeContract({
    customContractAddress: safe.address.value,
    ..._getValidatedGetContractProps(safe.chainId, safe.version),
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

export const getReadOnlyGnosisSafeContract = (chain: ChainInfo, safeVersion: string = LATEST_SAFE_VERSION) => {
  const ethAdapter = createReadOnlyEthersAdapter()

  return ethAdapter.getSafeContract({
    singletonDeployment: getSafeContractDeployment(chain, safeVersion),
    ..._getValidatedGetContractProps(chain.chainId, safeVersion),
  })
}

// MultiSend

export const getMultiSendCallOnlyContract = (
  chainId: string,
  safeVersion: SafeInfo['version'],
  provider: Web3Provider,
) => {
  const ethAdapter = createEthersAdapter(provider)

  return ethAdapter.getMultiSendCallOnlyContract({
    singletonDeployment: getMultiSendCallOnlyContractDeployment(chainId, safeVersion),
    ..._getValidatedGetContractProps(chainId, safeVersion),
  })
}

export const getReadOnlyMultiSendCallOnlyContract = (chainId: string, safeVersion: SafeInfo['version']) => {
  const ethAdapter = createReadOnlyEthersAdapter()

  return ethAdapter.getMultiSendCallOnlyContract({
    singletonDeployment: getMultiSendCallOnlyContractDeployment(chainId, safeVersion),
    ..._getValidatedGetContractProps(chainId, safeVersion),
  })
}

// GnosisSafeProxyFactory

export const getReadOnlyProxyFactoryContract = (chainId: string, safeVersion: SafeInfo['version']) => {
  const ethAdapter = createReadOnlyEthersAdapter()

  return ethAdapter.getSafeProxyFactoryContract({
    singletonDeployment: getProxyFactoryContractDeployment(chainId, safeVersion),
    ..._getValidatedGetContractProps(chainId, safeVersion),
  })
}

// Fallback handler

export const getReadOnlyFallbackHandlerContract = (
  chainId: string,
  safeVersion: SafeInfo['version'],
): CompatibilityFallbackHandlerEthersContract => {
  const ethAdapter = createReadOnlyEthersAdapter()

  return ethAdapter.getCompatibilityFallbackHandlerContract({
    singletonDeployment: getFallbackHandlerContractDeployment(chainId, safeVersion),
    ..._getValidatedGetContractProps(chainId, safeVersion),
  })
}

// Sign messages deployment

export const getReadOnlySignMessageLibContract = (
  chainId: string,
  safeVersion: SafeInfo['version'],
): SignMessageLibEthersContract => {
  const ethAdapter = createReadOnlyEthersAdapter()

  return ethAdapter.getSignMessageLibContract({
    singletonDeployment: getSignMessageLibContractDeployment(chainId, safeVersion),
    ..._getValidatedGetContractProps(chainId, safeVersion),
  })
}
