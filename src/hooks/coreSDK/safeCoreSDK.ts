import chains from '@/config/chains'
import { getSafeSingletonDeployment, getSafeL2SingletonDeployment } from '@safe-global/safe-deployments'
import { getWeb3 } from '@/hooks/wallets/web3'
import ExternalStore from '@/services/ExternalStore'
import { Gnosis_safe__factory } from '@/types/contracts'
import { invariant } from '@/utils/helpers'
import { Web3Provider } from '@ethersproject/providers'
import Safe from '@safe-global/safe-core-sdk'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type EIP1193Provider } from '@web3-onboard/core'
import { ethers } from 'ethers'
import semverSatisfies from 'semver/functions/satisfies'

export const isLegacyVersion = (safeVersion: string): boolean => {
  const LEGACY_VERSION = '<1.3.0'
  return semverSatisfies(safeVersion, LEGACY_VERSION)
}

export const isValidSafeVersion = (safeVersion?: SafeInfo['version']): safeVersion is SafeVersion => {
  const SAFE_VERSIONS: SafeVersion[] = ['1.3.0', '1.2.0', '1.1.1', '1.0.0']
  return !!safeVersion && SAFE_VERSIONS.some((version) => semverSatisfies(safeVersion, version))
}

// `assert` does not work with arrow functions
export function assertValidSafeVersion<T extends SafeInfo['version']>(safeVersion?: T): asserts safeVersion {
  return invariant(isValidSafeVersion(safeVersion), `${safeVersion} is not a valid Safe version`)
}

export const createEthersAdapter = (provider = getWeb3()) => {
  if (!provider) {
    throw new Error('Unable to create `EthersAdapter` without a provider')
  }

  const signer = provider.getSigner(0)
  return new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })
}

// Safe Core SDK
export const initSafeSDK = async (provider: EIP1193Provider, safe: SafeInfo): Promise<Safe | undefined> => {
  const masterCopy = safe.implementation.value

  const chainId = safe.chainId
  const safeAddress = safe.address.value
  let safeVersion = safe.version

  let isL1SafeMasterCopy = chainId === chains.eth

  const ethersProvider = new Web3Provider(provider)

  // If it is an official deployed master copy we should still initiate the safeSDK
  if (safeVersion === null) {
    safeVersion = await Gnosis_safe__factory.connect(safeAddress, ethersProvider).VERSION()

    const safeL1Deployment = getSafeSingletonDeployment({ network: chainId, version: safeVersion })
    const safeL2Deployment = getSafeL2SingletonDeployment({ network: chainId, version: safeVersion })

    isL1SafeMasterCopy = masterCopy === safeL1Deployment?.defaultAddress
    const isL2SafeMasterCopy = masterCopy === safeL2Deployment?.defaultAddress

    if (!isL1SafeMasterCopy && !isL2SafeMasterCopy) {
      // Unknown masterCopy, which we do not want to support
      return Promise.resolve(undefined)
    }
  } else {
    // Legacy Safe contracts
    if (isLegacyVersion(safeVersion)) {
      isL1SafeMasterCopy = true
    }
  }

  return Safe.create({
    ethAdapter: createEthersAdapter(ethersProvider),
    safeAddress,
    isL1SafeMasterCopy,
  })
}

export const {
  getStore: getSafeSDK,
  setStore: setSafeSDK,
  useStore: useSafeSDK,
} = new ExternalStore<Safe | undefined>()
