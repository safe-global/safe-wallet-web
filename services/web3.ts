import Web3 from 'web3'
import semverSatisfies from 'semver/functions/satisfies'
import { WalletState } from '@web3-onboard/core'
import Web3Adapter from '@gnosis.pm/safe-web3-lib'
import Safe from '@gnosis.pm/safe-core-sdk'
import type { provider } from 'web3-core'

import { CHAIN_ID, formatRpcServiceUrl } from '@/config/chains'
import { store } from '@/store'
import { selectChains } from '@/store/chainsSlice'
import { INFURA_TOKEN } from '@/config/constants'
import { _getOnboardState, getPrimaryWallet } from '@/services/onboard'

const LEGACY_VERSION = '<1.3.0'

const _web3: { [wallet: string]: Web3 } = {}

export const setWeb3 = (wallets: WalletState[]): void => {
  for (const { label, provider } of Object.values(wallets)) {
    _web3[label] = new Web3(provider as unknown as provider)
  }
}

export const getWeb3 = (wallet: string): Web3 => {
  return _web3[wallet]
}

const _web3ReadOnly: { [chainId: string]: Web3 } = {}

export const getWeb3ReadOnly = (chainId: string): Web3 => {
  const chains = selectChains(store.getState())
  const chain = chains.find((chain) => chain.chainId === chainId)

  if (!chain) {
    throw new Error(`Chain ${chainId} not found.`)
  }

  if (!_web3ReadOnly[chainId]) {
    _web3ReadOnly[chainId] = new Web3(
      new Web3.providers.HttpProvider(formatRpcServiceUrl(chain.rpcUri, INFURA_TOKEN), {
        timeout: 10_000,
      }),
    )
  }

  return _web3ReadOnly[chainId]
}

export const getWeb3Adapter = (signerAddress: string): Web3Adapter => {
  const { wallets } = _getOnboardState()
  const { label } = getPrimaryWallet(wallets)
  return new Web3Adapter({
    web3: getWeb3(label),
    signerAddress,
  })
}

// Safe Core SDK
let safeSDK: Safe
export const getSafeSDK = (): Safe => safeSDK

export const setSafeSDK = async (
  signerAddress: string,
  chainId: string,
  safeAddress: string,
  safeVersion: string,
): Promise<void> => {
  const ethAdapter = getWeb3Adapter(signerAddress)

  const isL1SafeMasterCopy = semverSatisfies(safeVersion, LEGACY_VERSION) ? true : chainId === CHAIN_ID.MAINNET

  safeSDK = await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}
