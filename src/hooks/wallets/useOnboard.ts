import { WEB3MODAL_PROJECT_ID } from '@/config/constants'
import { type WalletState, type OnboardAPI } from '@web3-onboard/core'
import type { Eip1193Provider } from 'ethers'
import { getAddress } from 'ethers'
import ExternalStore from '@/services/ExternalStore'
import { logError, Errors } from '@/services/exceptions'
import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { formatAmount } from '@/utils/formatNumber'
import { isWalletConnect } from '@/utils/wallets'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: Eip1193Provider
  icon?: string
  balance?: string
}

const { getStore, setStore, useStore } = new ExternalStore<Web3ModalAPI>()

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
    const balanceString = tokenBalance?.[1] || ''
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
    }
  } catch (e) {
    logError(Errors._106, e)
    return null
  }
}

const getWalletConnectLabel = async (wallet: ConnectedWallet): Promise<string | undefined> => {
  const UNKNOWN_PEER = 'Unknown'
  if (!isWalletConnect(wallet)) return
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
  onboard: Web3ModalAPI,
  options?: Parameters<OnboardAPI['connectWallet']>[0],
): Promise<WalletState[] | undefined> => {
  if (isConnecting) {
    return
  }

  isConnecting = true

  let wallets: WalletState[] | undefined

  try {
    await onboard.connectWallet()
  } catch (e) {
    logError(Errors._302, e)
    isConnecting = false

    return
  }

  isConnecting = false

  return wallets
}

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = WEB3MODAL_PROJECT_ID

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
}

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com',
}

// 3. Create a metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/'],
}
// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
})

export function Web3Modal({ children }: { children: any }) {
  return children
}

export type Web3ModalAPI = {
  disconnectWallet: () => Promise<void>
  connectWallet: () => Promise<void>
  switchNetwork: (chainId: number) => Promise<void>
  isConnected: boolean
  address: `0x${string}` | undefined
  chainId: number | undefined
}

export default useStore
