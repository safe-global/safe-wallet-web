import { useEffect, useState } from 'react'
import Web3 from 'web3'
import Onboard, { type OnboardAPI, type WalletState } from '@web3-onboard/core'
import type { AppState } from '@web3-onboard/core/dist/types'

import SafeLogoNoText from '@/public/safeLogoNoText.svg'
import { getDefaultWallets, getRecommendedInjectedWallets } from '@/services/wallets'
import useSafeAddress from '@/services/useSafeAddress'
import useChains from '@/services/useChains'
import useSafeInfo from '@/services/useSafeInfo'
import { getRpcServiceUrl, setSafeSDK, setWeb3 } from '@/services/web3'

let onboardSingleton: OnboardAPI | null = null

// Prior to multiple-wallet implementation, we use [0] as the 'connected' wallet
export const getConnectedWallet = (wallets: WalletState[]) => {
  return wallets[0]
}

const getOnboardState = (): AppState => {
  if (!onboardSingleton) {
    throw new Error('@web3-onboard is not initialized')
  }
  return onboardSingleton.state.get()
}

export const getConnectedWalletAddress = (wallets: WalletState[] = getOnboardState().wallets): string => {
  const primaryWallet = getConnectedWallet(wallets)
  if (!primaryWallet) {
    return ''
  }
  const primaryAccount = primaryWallet.accounts[0]
  return primaryAccount.address
}

// We must cache the initialization as useOnboard is used in multiple places
let promise: Promise<OnboardAPI> | null = null

export const useOnboard = (): OnboardAPI | null => {
  const [onboard, setOnboard] = useState<OnboardAPI | null>(onboardSingleton)

  const { address, chainId } = useSafeAddress()
  const { configs } = useChains()
  const { safe } = useSafeInfo()

  useEffect(() => {
    if (configs.length === 0 || onboardSingleton) {
      return
    }

    const init = async () => {
      const onboardInstance = await (promise ||= (async () =>
        Onboard({
          wallets: await getDefaultWallets(),
          chains: configs.map(({ chainId, chainName, nativeCurrency, rpcUri, theme }) => ({
            id: Web3.utils.numberToHex(chainId),
            label: chainName,
            rpcUrl: getRpcServiceUrl(rpcUri),
            token: nativeCurrency.symbol,
            color: theme.backgroundColor,
          })),
          accountCenter: {
            desktop: { enabled: false },
          },
          appMetadata: {
            name: 'Gnosis Safe',
            icon: SafeLogoNoText.toString(),
            description: 'Please select a wallet to connect to Gnosis Safe',
            recommendedInjectedWallets: getRecommendedInjectedWallets(),
          },
        }))())

      setOnboard(onboardInstance)

      onboardSingleton = onboardInstance
    }

    init()
  }, [configs])

  // Sync Web3 and Safe SDK with the current wallet state
  useEffect(() => {
    if (!onboard) {
      return
    }

    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      setWeb3(wallets)
      setSafeSDK(getConnectedWalletAddress(wallets), chainId, address, safe.version)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [chainId, address, safe.version])

  return onboard
}

export default useOnboard

export const useWalletAddress = (): string => {
  const onboard = useOnboard()
  return onboard ? getConnectedWalletAddress(onboard.state.get().wallets) : ''
}
