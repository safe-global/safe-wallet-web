import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getDelegates } from '@safe-global/safe-gateway-typescript-sdk'
import { createContext, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import useOnboard, { type ConnectedWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'

export const WalletContext = createContext<ConnectedWallet | null>(null)

const WalletProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const onboard = useOnboard()
  const onboardWallets = onboard?.state.get().wallets || []
  const [wallet, setWallet] = useState<ConnectedWallet | null>(getConnectedWallet(onboardWallets))
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()

  useEffect(() => {
    if (!onboard) return

    const walletSubscription = onboard.state.select('wallets').subscribe(async (wallets) => {
      const newWallet = getConnectedWallet(wallets)

      if (newWallet && chainId && safeAddress) {
        const delegates = await getDelegates(chainId, { safe: safeAddress })
        newWallet.isDelegate = delegates.results.some((delegate) => delegate.delegate === newWallet.address)
      }

      setWallet(newWallet)
    })

    return () => {
      walletSubscription.unsubscribe()
    }
  }, [chainId, onboard, safeAddress])

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export default WalletProvider
