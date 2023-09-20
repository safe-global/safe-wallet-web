import { createContext, useEffect, useState } from 'react'
import WalletConnectWallet from './WalletConnectWallet'

const walletConnect = new WalletConnectWallet()

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet
  initError: Error | null
}>({
  walletConnect,
  initError: null,
})

export const WalletConnectProvider = ({ children }: { children: JSX.Element }) => {
  const [initError, setInitError] = useState<Error | null>(null)

  useEffect(() => {
    walletConnect.init().catch(setInitError)
  }, [])

  return <WalletConnectContext.Provider value={{ walletConnect, initError }}>{children}</WalletConnectContext.Provider>
}
