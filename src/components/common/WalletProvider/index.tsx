import { createContext, type ReactElement, type ReactNode, useEffect, useState, useMemo } from 'react'
import useOnboard, { type ConnectedWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { getNestedWallet } from '@/hooks/wallets/useNestedSafeWallet'
import useAsync from '@/hooks/useAsync'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useCurrentChain } from '@/hooks/useChains'
import { useRouter } from 'next/router'
import ExternalStore from '@/services/ExternalStore'
import { type Eip1193Provider } from 'ethers'

const { setStore, useStore } = new ExternalStore<string | null>(null)

export const setNestedSafeAddress = setStore
export const useNestedSafeAddress = useStore

export type SignerWallet = {
  provider: Eip1193Provider | null
  address: string
  chainId: string
}

export type WalletContextType = {
  connectedWallet: ConnectedWallet | null
  signer: SignerWallet | null
}

export const WalletContext = createContext<WalletContextType | null>(null)

const WalletProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const onboard = useOnboard()
  const currentChain = useCurrentChain()
  const web3ReadOnly = useWeb3ReadOnly()
  const router = useRouter()
  const onboardWallets = onboard?.state.get().wallets || []
  const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet(onboardWallets))

  const nestedSafeAddress = useStore()

  const [nestedSafeInfo] = useAsync(() => {
    if (nestedSafeAddress && currentChain) {
      return getSafeInfo(currentChain?.chainId, nestedSafeAddress)
    }
  }, [currentChain, nestedSafeAddress])

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe((wallets) => {
      const newWallet = getConnectedWallet(wallets)

      setWallet(newWallet)
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [onboard])

  const nestedWallet = useMemo(() => {
    if (wallet && nestedSafeInfo && web3ReadOnly && currentChain) {
      return getNestedWallet(wallet, nestedSafeInfo, web3ReadOnly, router, currentChain)
    }
    return wallet
  }, [wallet, nestedSafeInfo, web3ReadOnly, router, currentChain])

  console.log('Wallet Provider Signer ASD', nestedWallet)

  return (
    <WalletContext.Provider
      value={{
        connectedWallet: wallet,
        signer: nestedWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
