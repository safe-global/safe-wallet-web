import { web3Onboard } from '@web3-onboard/react'
import type { WalletState } from '@web3-onboard/core'
import type { Account, AppState } from '@web3-onboard/core/dist/types'

export const getPrimaryWallet = (wallets: WalletState[]): WalletState => {
  return wallets[0]
}

export const getPrimaryAccount = (wallets: WalletState[]): Account => {
  const { accounts } = getPrimaryWallet(wallets)
  return accounts[0]
}

export const _getOnboardState = (): AppState => {
  if (!web3Onboard) {
    throw new Error('@web3-onboard is not initialized')
  }
  return web3Onboard.state.get()
}
