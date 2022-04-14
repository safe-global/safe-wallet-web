import Web3 from 'web3'
import type { provider } from 'web3-core'
import type { WalletState } from '@web3-onboard/core'

import { formatRpcServiceUrl } from 'utils/chains'
import { store } from 'store'
import { selectChains } from 'store/chainsSlice'

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
      new Web3.providers.HttpProvider(formatRpcServiceUrl(chain.rpcUri), {
        timeout: 10_000,
      }),
    )
  }

  return _web3ReadOnly[chainId]
}
