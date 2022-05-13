import Web3 from 'web3'
import { useEffect, useState } from 'react'
import Onboard, { EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getAllWallets, getRecommendedInjectedWallets, getSupportedWallets } from '@/services/wallets/wallets'
import { getRpcServiceUrl } from '@/services/wallets/web3'
import useChains, { useCurrentChain } from '../useChains'
import useLocalStorage from '../localStorage/useLocalStorage'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

const createOnboard = (chainConfigs: ChainInfo[]): OnboardAPI => {
  const wallets = getAllWallets()

  return Onboard({
    wallets,
    chains: chainConfigs.map((cfg) => ({
      id: Web3.utils.numberToHex(cfg.chainId),
      label: cfg.chainName,
      rpcUrl: getRpcServiceUrl(cfg.rpcUri),
      token: cfg.nativeCurrency.symbol,
      color: cfg.theme.backgroundColor,
    })),
    accountCenter: {
      desktop: { enabled: false },
    },
    appMetadata: {
      name: 'Gnosis Safe',
      icon: '/logo-no-text.svg',
      description: 'Please select a wallet to connect to Gnosis Safe',
      recommendedInjectedWallets: getRecommendedInjectedWallets(),
    },
  })
}

let onboardSingleton: OnboardAPI | null = null

const initOnboardSingleton = (chainConfigs: ChainInfo[]): OnboardAPI => {
  if (!onboardSingleton) {
    onboardSingleton = createOnboard(chainConfigs)
  }
  return onboardSingleton
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets = onboardSingleton?.state.get().wallets): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet?.accounts[0]
  if (!account) return null

  return {
    label: primaryWallet.label,
    address: Web3.utils.toChecksumAddress(account.address),
    ens: account.ens?.name,
    chainId: Web3.utils.hexToNumberString(primaryWallet.chains[0].id),
    provider: primaryWallet.provider,
  }
}

// Initialize an onboard singleton when chains are loaded
// Return a cached singleton if already initialized
export const useOnboard = (): OnboardAPI | null => {
  const [onboard, setOnboard] = useState<OnboardAPI | null>(null)
  const { configs } = useChains()

  useEffect(() => {
    if (!configs.length) return

    setOnboard((prev) => prev || initOnboardSingleton(configs))
  }, [configs])

  return onboard
}

const LAST_USED_WALLET_KEY = 'lastUsedWallet'

// Disable/enable wallets according to chain and cache the last used wallet
export const useInitOnboard = () => {
  const onboard = useOnboard()
  const chain = useCurrentChain()
  const [lastUsedWallet, setLastUsedWallet] = useLocalStorage<string>(LAST_USED_WALLET_KEY)

  useEffect(() => {
    if (!onboard || !chain?.disabledWallets) {
      return
    }

    const supportedModules = getSupportedWallets(chain.disabledWallets)
    // @ts-expect-error types aren't correct
    onboard.state.actions.setWalletModules(supportedModules)
  }, [onboard, chain?.disabledWallets])

  useEffect(() => {
    if (!onboard) {
      return
    }

    if (lastUsedWallet) {
      onboard.connectWallet({ autoSelect: { disableModals: true, label: lastUsedWallet } })
    }

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      const connectedWallet = getConnectedWallet(wallets)
      if (connectedWallet) {
        setLastUsedWallet(connectedWallet.label)
      } else {
        setLastUsedWallet('')
      }
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard, lastUsedWallet, setLastUsedWallet])
}

export default useOnboard
