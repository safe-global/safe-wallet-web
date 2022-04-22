import type { OnboardAPI, WalletState } from '@web3-onboard/core'
import connect from '@web3-onboard/core/dist/connect'
import type { Account, AppState } from '@web3-onboard/core/dist/types'
import { useCallback, useEffect, useState } from 'react'

export let _onboardInstance: OnboardAPI | null = null

export const getOnboardInstance = (): OnboardAPI | null => {
  return _onboardInstance
}

export const setOnboardInstance = (onboardInstance: OnboardAPI): void => {
  _onboardInstance = onboardInstance
}

export const getPrimaryWallet = (wallets: WalletState[]): WalletState => {
  return wallets[0]
}

export const getPrimaryAccount = (wallets: WalletState[]): Account => {
  const { accounts } = getPrimaryWallet(wallets)
  return accounts[0]
}

export const _getOnboardState = (): null | AppState => {
  if (!_onboardInstance) {
    return null
  }
  return _onboardInstance.state.get()
}

export const useWallets = () => {
  const [wallets, setWallets] = useState<WalletState[]>([])

  useEffect(() => {
    const onboardState = _getOnboardState()
    if (!onboardState) {
      setWallets([])
    } else {
      setWallets(onboardState.wallets)
    }
  }, [_onboardInstance])

  return wallets
}

export const useConnectWallet = () => {
  const connectWallet = useCallback(
    async (...options: Parameters<typeof connect>) => {
      return await _onboardInstance?.connectWallet(...options)
    },
    [_onboardInstance],
  )

  return connectWallet
}
