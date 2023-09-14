import useSafeWalletProvider from '@/safe-wallet-provider/useSafeWalletProvider'
import { useEffect, useState, useMemo } from 'react'
import useSafeInfo from '../useSafeInfo'
import WalletConnectWallet from './WalletConnectWallet'

const useWalletConnect = () => {
  const { safe, safeAddress } = useSafeInfo()
  const chainId = safe?.chainId
  const [wallet, setWallet] = useState<WalletConnectWallet | null>(null)
  const safeWalletProvider = useSafeWalletProvider()

  // Initialize a WC wallet for the current Safe account
  useEffect(() => {
    if (!safeAddress || !chainId) return

    const wcWallet = new WalletConnectWallet(safeAddress, chainId)

    setWallet(wcWallet)

    return () => {
      wcWallet.disconnect()
      setWallet(null)
    }
  }, [safeAddress, chainId])

  // Subscribe to RPC requests
  useEffect(() => {
    if (!wallet || !safeWalletProvider) return

    wallet.addOnRequest((method, params) => {
      console.log('WalletConnect request', method, params)

      return safeWalletProvider?.request({ method, params })
    })
  }, [safeAddress, wallet, safeWalletProvider])

  return useMemo(
    () => ({
      // Pair the wallet with a dapp via the pairing URI
      connect: (uri: string) => wallet?.connect(uri),
    }),
    [wallet],
  )
}

export default useWalletConnect
