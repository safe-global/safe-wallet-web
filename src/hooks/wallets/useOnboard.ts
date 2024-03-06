import type { TempAPI, WalletState } from '@/components/safe-apps/types'
import ExternalStore from '@/services/ExternalStore'
import { WALLET_EVENTS, trackEvent } from '@/services/analytics'
import { Errors, logError } from '@/services/exceptions'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { formatAmount } from '@/utils/formatNumber'
import type { Eip1193Provider } from 'ethers'
import { getAddress } from 'ethers'

const WALLETCONNECT = 'WalletConnect'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: Eip1193Provider
  icon?: string
  balance?: string
  switchChain?: any
}

const { getStore, setStore, useStore } = new ExternalStore<TempAPI>()

export const initOnboard = async (currentAccount: string, chain: any, provider: any, switchChain: any) => {
  const { createOnboard } = await import('@/services/onboard')
  setStore(createOnboard(currentAccount, chain, provider, switchChain))
}

// Get the most recently connected wallet address
export const getConnectedWallet = (wallets: WalletState[]): ConnectedWallet | null => {
  if (!wallets) return null

  const primaryWallet = wallets[0]
  if (!primaryWallet) return null

  const account = primaryWallet.accounts[0]
  if (!account) return null

  let balance = ''
  if (account.balance) {
    const tokenBalance = Object.entries(account.balance)[0]
    const token = tokenBalance?.[0] || ''
    const balanceString = (tokenBalance?.[1] || '') as string
    const balanceNumber = parseFloat(balanceString)
    if (Number.isNaN(balanceNumber)) {
      balance = balanceString
    } else {
      const balanceFormatted = formatAmount(balanceNumber)
      balance = `${balanceFormatted} ${token}`
    }
  }

  try {
    const address = getAddress(account.address)
    return {
      label: primaryWallet.label,
      address,
      ens: account.ens?.name,
      chainId: Number(primaryWallet.chains[0].id).toString(10),
      provider: primaryWallet.provider,
      icon: primaryWallet.icon,
      balance,
      // @ts-ignore
      switchChain: primaryWallet?.switchChain,
    }
  } catch (e) {
    logError(Errors._106, e)
    return null
  }
}

const getWalletConnectLabel = async (wallet: ConnectedWallet): Promise<string | undefined> => {
  const UNKNOWN_PEER = 'Unknown'
  const { label } = wallet
  const isWalletConnect = label.startsWith(WALLETCONNECT)
  if (!isWalletConnect) return
  const { connector } = wallet.provider as unknown as any
  const peerWalletV2 = connector.session?.peer?.metadata?.name
  return peerWalletV2 || UNKNOWN_PEER
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

let isConnecting = false

// Wrapper that tracks/sets the last used wallet
export const connectWallet = async (
  onboard: TempAPI,
  options?: Parameters<TempAPI['connectWallet']>[0],
): Promise<WalletState[] | undefined> => {
  debugger
  if (isConnecting) {
    return
  }

  isConnecting = true

  let wallets: WalletState[] | undefined

  try {
    wallets = await onboard.connectWallet(options)
  } catch (e) {
    logError(Errors._302, e)
    isConnecting = false

    return
  }

  isConnecting = false

  return wallets
}

export const switchWallet = async (onboard: TempAPI) => {
  debugger
  const oldWalletLabel = getConnectedWallet(getOnboardStore?.()?.state.get().wallets)?.label
  const newWallets = await connectWallet(onboard)
  const newWalletLabel = newWallets ? getConnectedWallet(newWallets)?.label : undefined

  // If the wallet actually changed we disconnect the old connected wallet.
  if (!newWalletLabel || oldWalletLabel !== ONBOARD_MPC_MODULE_LABEL) {
    return
  }

  if (newWalletLabel !== oldWalletLabel) {
    await onboard.disconnectWallet({ label: oldWalletLabel })
  }
}

// const lastWalletStorage = localItem<string>('lastWallet')

// const connectLastWallet = async (onboard: TempAPI) => {
//   const lastWalletLabel = lastWalletStorage.get()
//   if (lastWalletLabel) {
//     const isUnlocked = await isWalletUnlocked(lastWalletLabel)

//     if (isUnlocked === true || isUnlocked === undefined) {
//       connectWallet(onboard, {
//         autoSelect: { label: lastWalletLabel, disableModals: isUnlocked || false },
//       })
//     }
//   }
// }

// const saveLastWallet = (walletLabel: string) => {
//   lastWalletStorage.set(walletLabel)
// }

// Disable/enable wallets according to chain
export const useInitOnboard = () => {
  // const { configs } = useChains()
  // const chain = useCurrentChain()
  // const onboard = useStore()
  // const customRpc = useAppSelector(selectRpc)
  // const onboardWallets = onboard?.state.get().wallets || []
  // const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet(onboardWallets))
  // let currentAccount = useParticleAccount() || ''
  // currentAccount = checksumAddress(currentAccount)
  // const provider = useParticleProvider()
  // const { switchChain } = useSwitchChains()
  // useEffect(() => {
  //   if (currentAccount && (wallet?.chainId || chain?.chainId)) {
  //     void initOnboard(currentAccount, wallet?.chainId ? wallet : chain, provider, switchChain)
  //   }
  // }, [provider, currentAccount, wallet?.chainId, chain, switchChain])
  // console.log('>>>wallet?.chainId', wallet?.chainId)
  // Disable unsupported wallets on the current chain
  // useEffect(() => {
  //   if (!onboard || !chain) return
  //   const enableWallets = async () => {
  //     const { getSupportedWallets } = await import('@/hooks/wallets/wallets')
  //     const supportedWallets = getSupportedWallets(chain)
  //     onboard.state.actions.setWalletModules(supportedWallets)
  //   }
  //   enableWallets().then(() => {
  //     // e2e wallet
  //     if (typeof window !== 'undefined' && window.Cypress) {
  //       connectWallet(onboard, {
  //         autoSelect: { label: E2E_WALLET_NAME, disableModals: true },
  //       })
  //     }
  //     // Reconnect last wallet
  //     connectLastWallet(onboard)
  //   })
  // }, [chain, onboard])
  // Track connected wallet
  // TODO
  // useEffect(() => {
  //   let lastConnectedWallet = ''
  //   if (!onboard) return
  //   const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
  //     const newWallet = getConnectedWallet(wallets)
  //     if (newWallet) {
  //       if (newWallet.label !== lastConnectedWallet) {
  //         lastConnectedWallet = newWallet.label
  //         saveLastWallet(lastConnectedWallet)
  //         trackWalletType(newWallet)
  //       }
  //     } else if (lastConnectedWallet) {
  //       lastConnectedWallet = ''
  //       saveLastWallet(lastConnectedWallet)
  //     }
  //   })
  //   return () => {
  //     walletSubscription.unsubscribe()
  //   }
  // }, [onboard])
}
export const getOnboardStore = getStore

export default useStore
