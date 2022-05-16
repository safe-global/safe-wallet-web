import { EIP1193Provider } from '@web3-onboard/core'
import Safe from '@gnosis.pm/safe-core-sdk'
import { ethers } from 'ethers'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import semverSatisfies from 'semver/functions/satisfies'
import chains from '@/config/chains'

const isLegacyVersion = (safeVersion: string): boolean => {
  const LEGACY_VERSION = '<1.3.0'
  return semverSatisfies(safeVersion, LEGACY_VERSION)
}

// Safe Core SDK
const initSafeSDK = async (
  provider: EIP1193Provider,
  walletChainId: string,
  safeAddress: string,
  safeVersion: string,
): Promise<Safe> => {
  const ethersProvider = new ethers.providers.Web3Provider(provider)
  const signer = ethersProvider.getSigner(0)
  const ethAdapter = new EthersAdapter({
    ethers,
    signer,
  })

  let isL1SafeMasterCopy = walletChainId === chains.eth
  // Legacy Safe contracts
  if (isLegacyVersion(safeVersion)) {
    isL1SafeMasterCopy = true
  }

  return await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}

let safeSDK: Safe
export const getSafeSDK = (): Safe => safeSDK
export const setSafeSDK: typeof initSafeSDK = (...args) => initSafeSDK(...args).then((safe) => (safeSDK = safe))
