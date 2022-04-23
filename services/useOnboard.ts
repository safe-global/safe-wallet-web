import { useEffect, useState } from 'react'
import Web3 from 'web3'
import Onboard, { type OnboardAPI, type WalletState } from '@web3-onboard/core'

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

export const getConnectedWalletAddress = (wallets = onboardSingleton?.state.get().wallets): string => {
  if (!wallets) {
    return ''
  }

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
  const { configs } = useChains()

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

  return onboard
}

export default useOnboard

export const useInitOnboard = (): void => {
  const onboard = useOnboard()
  const { chainId, address } = useSafeAddress()
  const { safe } = useSafeInfo()

  // Sync Web3 and Safe SDK with the current wallet state
  useEffect(() => {
    if (!onboard || !chainId || !address || !safe.version) {
      return
    }

    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      setWeb3(wallets)
      // Safe SDK must be initialised after Web3
      setSafeSDK(getConnectedWalletAddress(wallets), chainId, address, safe.version)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [chainId, address, safe.version, onboard])
}

export const useWalletAddress = (): string => {
  const onboard = useOnboard()
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    const subscription = onboard?.state.select('wallets').subscribe((wallets) => {
      setWalletAddress(wallets.length > 0 ? getConnectedWalletAddress(wallets) : '')
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [onboard])

  return walletAddress
}
