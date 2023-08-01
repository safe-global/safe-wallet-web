import { useEffect } from 'react'
import { type EIP1193Provider, type WalletState, type OnboardAPI } from '@web3-onboard/core'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getAddress } from 'ethers/lib/utils'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import ExternalStore from '@/services/ExternalStore'
import { logError, Errors } from '@/services/exceptions'
import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { useInitPairing } from '@/services/pairing/hooks'
import { useAppSelector } from '@/store'
import { type EnvState, selectRpc } from '@/store/settingsSlice'
import { WALLET_KEYS } from './consts'
import { E2E_WALLET_NAME } from '@/tests/e2e-wallet'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
  icon?: string
}

const { getStore, setStore, useStore } = new ExternalStore<OnboardAPI>()

export const initOnboard = async (
  chainConfigs: ChainInfo[],
  currentChain: ChainInfo,
  rpcConfig: EnvState['rpc'] | undefined,
) => {
  const { createOnboard } = await import('@/services/onboard')
  if (!getStore()) {
    setStore(createOnboard(chainConfigs, currentChain, rpcConfig))
  }
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets: WalletState[]): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet.accounts[0]
  if (!account) return null

  try {
    const address = getAddress(account.address)
    return {
      label: primaryWallet.label,
      address,
      ens: account.ens?.name,
      chainId: Number(primaryWallet.chains[0].id).toString(10),
      provider: primaryWallet.provider,
      icon: primaryWallet.icon,
    }
  } catch (e) {
    logError(Errors._106, e)
    return null
  }
}

const getWalletConnectLabel = async ({ label, provider }: ConnectedWallet): Promise<string | undefined> => {
  if (label.toUpperCase() !== WALLET_KEYS.WALLETCONNECT.toUpperCase()) return

  const UNKNOWN_PEER = 'Unknown'
  const { default: WalletConnect } = await import('@walletconnect/client')

  const peerWallet =
    ((provider as unknown as any).connector as InstanceType<typeof WalletConnect>).peerMeta?.name || UNKNOWN_PEER

  return peerWallet ?? UNKNOWN_PEER
}

const trackWalletType = (wallet: ConnectedWallet) => {
  trackEvent({ ...WALLET_EVENTS.CONNECT, label: wallet.label })

  getWalletConnectLabel(wallet)
    .then((wcLabel) => {
      if (wcLabel) {
        trackEvent({
          ...WALLET_EVENTS.WALLET_CONNECT,
          label: wcLabel,
        })
      }
    })
    .catch(() => null)
}

// Detect mobile devices
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

// Detect injected wallet
const hasInjectedWallet = () => typeof window !== 'undefined' && !!window?.ethereum

// `connectWallet` is called when connecting/switching wallets and on pairing `connect` event (when prev. session connects)
// This re-entrant lock prevents multiple `connectWallet`/tracking calls that would otherwise occur for pairing module
let isConnecting = false

// Wrapper that tracks/sets the last used wallet
export const connectWallet = async (
  onboard: OnboardAPI,
  options?: Parameters<OnboardAPI['connectWallet']>[0],
): Promise<WalletState[] | undefined> => {
  const WALLETCONNECT_V2 = 'WalletConnect'

  if (isConnecting) {
    return
  }

  isConnecting = true

  // On mobile, automatically choose WalletConnect if there is no injected wallet
  if (!options && isMobile() && !hasInjectedWallet()) {
    options = {
      autoSelect: WALLETCONNECT_V2,
    }
  }

  // e2e wallet
  if (typeof window !== 'undefined' && window.Cypress) {
    options = {
      autoSelect: { label: E2E_WALLET_NAME, disableModals: true },
    }
  }

  let wallets: WalletState[] | undefined

  try {
    wallets = await onboard.connectWallet(options)
  } catch (e) {
    logError(Errors._302, e)

    isConnecting = false
    return
  }

  // Save the last used wallet and track the wallet type
  const newWallet = getConnectedWallet(wallets)

  if (newWallet) {
    // Track
    trackWalletType(newWallet)
  }

  isConnecting = false

  return wallets
}

export const switchWallet = (onboard: OnboardAPI) => {
  connectWallet(onboard)
}

// Disable/enable wallets according to chain
export const useInitOnboard = () => {
  const { configs } = useChains()
  const chain = useCurrentChain()
  const onboard = useStore()
  const customRpc = useAppSelector(selectRpc)

  useInitPairing()

  useEffect(() => {
    if (configs.length > 0 && chain) {
      void initOnboard(configs, chain, customRpc)
    }
  }, [configs, chain, customRpc])

  // Disable unsupported wallets on the current chain
  useEffect(() => {
    if (!onboard || !chain) return

    const enableWallets = async () => {
      const { getSupportedWallets } = await import('@/hooks/wallets/wallets')
      const supportedWallets = getSupportedWallets(chain)
      onboard.state.actions.setWalletModules(supportedWallets)
    }
    enableWallets()
  }, [chain, onboard])
}

export default useStore
