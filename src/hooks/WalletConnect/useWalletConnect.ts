import { useEffect, useState, useMemo } from 'react'
import useSafeInfo from '../useSafeInfo'
import { useWeb3ReadOnly } from '../wallets/web3'
import WalletConnectWallet from './WalletConnectWallet'

const useWalletConnect = () => {
  const { safe, safeAddress } = useSafeInfo()
  const chainId = safe?.chainId
  const [wallet, setWallet] = useState<WalletConnectWallet | null>(null)
  const web3ReadOnly = useWeb3ReadOnly()

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
    if (!wallet || !web3ReadOnly) return

    wallet.addOnRequest((method, params) => {
      console.log('WalletConnect request', method, params)

      if (method === 'eth_accounts') {
        return Promise.resolve([safeAddress])
      }

      return web3ReadOnly?.send(method, params)
    })
  }, [safeAddress, wallet, web3ReadOnly])

  return useMemo(
    () => ({
      // Pair the wallet with a dapp via the pairing URI
      connect: (uri: string) => wallet?.connect(uri),
    }),
    [wallet],
  )
}

export default useWalletConnect
