import { useEffect } from 'react'
import { type EIP1193Provider, type WalletState, type OnboardAPI } from '@web3-onboard/core'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getAddress } from 'ethers/lib/utils'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import ExternalStore from '@/services/ExternalStore'
import { localItem } from '@/services/local-storage/local'
import { logError, Errors } from '@/services/exceptions'
import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { WALLET_KEYS } from '@/hooks/wallets/wallets'

export const lastWalletStorage = localItem<string>('lastWallet')

const { getStore, setStore, useStore } = new ExternalStore<OnboardAPI>()

export const initOnboard = async (chainConfigs: ChainInfo[]) => {
  const { createOnboard } = await import('@/services/onboard')
  if (!getStore()) {
    setStore(createOnboard(chainConfigs))
  }
}

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets: WalletState[]): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet?.accounts[0]
  if (!account) return null

  return {
    label: primaryWallet.label,
    address: getAddress(account.address),
    ens: account.ens?.name,
    chainId: Number(primaryWallet.chains[0].id).toString(10),
    provider: primaryWallet.provider,
  }
}

const getWalletConnectLabel = async ({ label, provider }: ConnectedWallet): Promise<string | undefined> => {
  if (label.toUpperCase() !== WALLET_KEYS.WALLETCONNECT) return

  const UNKNOWN_PEER = 'Unknown'
  const { default: WalletConnect } = await import('@walletconnect/client')

  const peerWallet =
    ((provider as unknown as any).connector as InstanceType<typeof WalletConnect>).peerMeta?.name || UNKNOWN_PEER

  return peerWallet ?? UNKNOWN_PEER
}

const trackWalletType = async (wallet: ConnectedWallet) => {
  trackEvent({ ...WALLET_EVENTS.CONNECT, label: wallet.label })

  const wcLabel = await getWalletConnectLabel(wallet)

  if (wcLabel) {
    trackEvent({
      ...WALLET_EVENTS.WALLET_CONNECT,
      label: wcLabel,
    })
  }
}

// Disable/enable wallets according to chain and cache the last used wallet
export const useInitOnboard = () => {
  const { configs } = useChains()
  const chain = useCurrentChain()
  const onboard = useStore()

  useEffect(() => {
    if (configs.length > 0) {
      initOnboard(configs)
    }
  }, [configs])

  // Disable unsupported wallets on the current chain
  useEffect(() => {
    if (!onboard || !chain?.disabledWallets) return

    const enableWallets = async () => {
      const { getSupportedWallets } = await import('@/hooks/wallets/wallets')
      const supportedWallets = getSupportedWallets(chain.disabledWallets)
      onboard.state.actions.setWalletModules(supportedWallets)
    }

    enableWallets()
  }, [chain?.disabledWallets, onboard])

  // Remember the last used wallet
  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe(async (wallets) => {
      const newWallet = getConnectedWallet(wallets)

      if (newWallet) {
        await trackWalletType(newWallet)

        lastWalletStorage.set(newWallet.label)
      }
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  // Connect to the last connected wallet
  useEffect(() => {
    if (onboard && onboard.state.get().wallets.length === 0) {
      const label = lastWalletStorage.get()

      if (label) {
        onboard
          .connectWallet({
            autoSelect: { label, disableModals: true },
          })
          .catch((e) => logError(Errors._302, (e as Error).message))
      }
    }
  }, [onboard])
}

export default useStore
