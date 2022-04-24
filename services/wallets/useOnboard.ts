import Web3 from 'web3'
import { useEffect, useState } from 'react'
import Onboard, { EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getDefaultWallets, getRecommendedInjectedWallets } from '@/services/wallets/wallets'
import { getRpcServiceUrl } from '@/services/wallets/web3'
//import SafeLogo from '@/public/logo-no-text.svg'
import useChains from '../useChains'
import { Errors, logError } from '../exceptions'

export type ConnectedWallet = {
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

const createOnboard = async (chainConfigs: ChainInfo[]): Promise<OnboardAPI> => {
  const wallets = await getDefaultWallets()

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
let onboardPromise: Promise<OnboardAPI> | null = null

const initOnboardSingleton = async (chainConfigs: ChainInfo[]): Promise<OnboardAPI> => {
  if (onboardSingleton) {
    return onboardSingleton
  }
  if (onboardPromise) {
    return onboardPromise
  }
  onboardPromise = createOnboard(chainConfigs)
  onboardPromise.then((onboard) => (onboardSingleton = onboard))
  onboardPromise.finally(() => (onboardPromise = null))
  return onboardPromise
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets = onboardSingleton?.state.get().wallets): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet?.accounts[0]
  if (!account) return null

  return {
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
    if (onboardSingleton) {
      setOnboard(onboardSingleton)
      return
    }

    if (onboardPromise) {
      onboardPromise.then((onb) => setOnboard(onb))
      return
    }

    if (!configs.length) return

    initOnboardSingleton(configs)
      .then(setOnboard)
      .catch((e) => logError(Errors._302, (e as Error).message))
  }, [configs])

  return onboard
}

export default useOnboard

export const useWallet = (): ConnectedWallet | null => {
  const onboard = useOnboard()
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null)

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      setWallet(getConnectedWallet(wallets))
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  return wallet
}
