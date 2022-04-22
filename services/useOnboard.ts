import { useCallback, useEffect, useSyncExternalStore } from 'react'
import Web3 from 'web3'
import Onboard, { type OnboardAPI, type WalletState } from '@web3-onboard/core'
import type { Account, AppState } from '@web3-onboard/core/dist/types'

import Safe from '@/public/safe.svg'
import { getDefaultWallets, getRecommendedInjectedWallets } from '@/services/wallets'
import useSafeAddress from '@/services/useSafeAddress'
import useChains from '@/services/useChains'
import useSafeInfo from '@/services/useSafeInfo'
import { setSafeSDK, setWeb3 } from '@/services/web3'
import { INFURA_TOKEN } from '@/config/constants'
import { formatRpcServiceUrl } from '@/services/chains'

let _onboardInstance: OnboardAPI | null = null

const getOnboardInstance = (): OnboardAPI => {
  if (!_onboardInstance) {
    throw new Error('@web3-onboard is not initialized')
  }
  return _onboardInstance
}

export const getPrimaryWallet = (wallets: WalletState[]): WalletState => {
  return wallets[0]
}

const getPrimaryAccount = (wallets: WalletState[]): Account => {
  return getPrimaryWallet(wallets)?.accounts[0] || undefined
}

export const getPrimaryWalletAddress = (wallets: WalletState[]): string => {
  return getPrimaryAccount(wallets)?.address || ''
}

export const getOnboardState = (): AppState => {
  return getOnboardInstance().state.get()
}

export const useInitOnboard = (): void => {
  const { configs, loading, error } = useChains()
  const { address, chainId } = useSafeAddress()
  const { safe } = useSafeInfo()

  useEffect(() => {
    if (configs.length === 0 || loading || error || _onboardInstance) {
      return
    }

    const initOnboard = async () => {
      _onboardInstance = Onboard({
        wallets: await getDefaultWallets(),
        chains: configs.map(({ chainId, chainName, nativeCurrency, rpcUri, theme }) => ({
          id: Web3.utils.numberToHex(chainId),
          label: chainName,
          rpcUrl: formatRpcServiceUrl(rpcUri, INFURA_TOKEN),
          token: nativeCurrency.symbol,
          color: theme.backgroundColor,
        })),
        accountCenter: {
          desktop: { position: 'bottomRight' },
        },
        appMetadata: {
          name: 'Gnosis Safe',
          icon: Safe.toString(),
          description: 'Please select a wallet to connect to Gnosis Safe',
          recommendedInjectedWallets: getRecommendedInjectedWallets(),
        },
      })
    }

    initOnboard()
  }, [loading, error, configs, chainId, _onboardInstance])

  useEffect(() => {
    if (!_onboardInstance) {
      return
    }

    const subscription = _onboardInstance.state.select('wallets').subscribe((wallets) => {
      setWeb3(wallets)
      setSafeSDK(getPrimaryWalletAddress(wallets), chainId, address, safe.version)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [_onboardInstance, chainId, chainId, address, safe.version])
}

export const useOnboardState: {
  (): AppState | undefined
  <K extends keyof AppState>(stateKey?: K): AppState[K] | undefined
} = (stateKey = undefined) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const select = _onboardInstance?.state.select
      const subscription = stateKey ? select?.(stateKey).subscribe(onStoreChange) : select?.().subscribe(onStoreChange)

      return () => {
        subscription?.unsubscribe()
      }
    },
    [_onboardInstance, stateKey],
  )

  const getSnapshot = useCallback(() => {
    const snapshot = _onboardInstance?.state.get()
    return stateKey ? snapshot?.[stateKey] : snapshot
  }, [_onboardInstance, stateKey])

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

const useOnboard = () => {
  return _onboardInstance
}

export default useOnboard
