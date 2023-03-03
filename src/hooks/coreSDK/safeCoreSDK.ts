import chains from '@/config/chains'
import { getWeb3 } from '@/hooks/wallets/web3'
import ExternalStore from '@/services/ExternalStore'
import { invariant } from '@/utils/helpers'
import { Web3Provider, type JsonRpcProvider } from '@ethersproject/providers'
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
export const initSafeSDK = async (
  readonlyProvider: JsonRpcProvider,
  walletProvider: EIP1193Provider,
  walletChainId: string,
  safeChainId: string,
  safeAddress: string,
  safeVersion: string,
): Promise<Safe> => {
  let isL1SafeMasterCopy = safeChainId === chains.eth
  // Legacy Safe contracts
  if (isLegacyVersion(safeVersion)) {
    isL1SafeMasterCopy = true
  }

  const signerProvider = new Web3Provider(walletProvider)

  // Monkey patch the signerProvider to proxy requests to the "readonly" provider if on the wrong chain
  if (walletChainId !== safeChainId) {
    const signerMethods = ['personal_sign', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4', 'eth_accounts']
    const originalSend = signerProvider.send

    signerProvider.send = (request, ...args) => {
      console.log(request, ...args)

      if (!signerMethods.includes(request)) {
        return readonlyProvider.send.call(readonlyProvider, request, ...args)
      }
      return originalSend.call(signerProvider, request, ...args)
    }
  }

  const ethAdapter = createEthersAdapter(signerProvider)

  return Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}

export const {
  getStore: getSafeSDK,
  setStore: setSafeSDK,
  useStore: useSafeSDK,
} = new ExternalStore<Safe | undefined>()
