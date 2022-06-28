import { EIP1193Provider } from '@web3-onboard/core'
import Safe from '@gnosis.pm/safe-core-sdk'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import semverSatisfies from 'semver/functions/satisfies'
import chains from '@/config/chains'
import { Web3Provider } from '@ethersproject/providers'
import ExternalStore from '@/services/ExternalStore'

const isLegacyVersion = (safeVersion: string): boolean => {
  const LEGACY_VERSION = '<1.3.0'
  return semverSatisfies(safeVersion, LEGACY_VERSION)
}

export const createEthersAdapter = (provider: Web3Provider) => {
  const signer = provider.getSigner(0)
  return new EthersAdapter({
    ethers,
    signer,
  })
}

// Safe Core SDK
export const initSafeSDK = async (
  provider: EIP1193Provider,
  walletChainId: string,
  safeAddress: string,
  safeVersion: string,
): Promise<Safe> => {
  let isL1SafeMasterCopy = walletChainId === chains.eth
  // Legacy Safe contracts
  if (isLegacyVersion(safeVersion)) {
    isL1SafeMasterCopy = true
  }

  const ethersProvider = new ethers.providers.Web3Provider(provider)
  return await Safe.create({
    ethAdapter: createEthersAdapter(ethersProvider),
    safeAddress,
    isL1SafeMasterCopy,
  })
}

export const { getStore: getSafeSDK, setStore: setSafeSDK, useStore: useSafeSDK } = new ExternalStore<Safe>()
