import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { useWalletInfo, useWeb3Modal } from '@web3modal/scaffold-react'
import { createContext, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'

export const WalletContext = createContext<ConnectedWallet | null>(null)

const WalletProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const { open, close } = useWeb3Modal()
  const { walletInfo } = useWalletInfo()
  const { safe } = useSafeInfo()
  const [wallet, setWallet] = useState<ConnectedWallet | null>(
    isConnected && chainId && walletProvider
      ? {
          label: walletInfo?.name || 'Wallet',
          address: address as `0x${string}`,
          chainId: chainId.toString(),
          provider: walletProvider,
          icon: walletInfo?.icon,
        }
      : null,
  )

  useEffect(() => {
    setWallet(
      isConnected && chainId && walletProvider
        ? {
            label: walletInfo?.name || 'Wallet',
            address: address as `0x${string}`,
            chainId: chainId.toString(),
            provider: walletProvider,
            icon: walletInfo?.icon,
          }
        : null,
    )
  }, [address, chainId, isConnected, walletInfo?.icon, walletInfo?.name, walletProvider])

  // EXPERIMENTAL: sync wallet and safe chain
  useEffect(() => {
    if (safe.chainId !== '' && chainId && Number(safe.chainId) !== chainId) {
      open({ view: 'Networks' })
    } else {
      close()
    }
  }, [chainId, close, open, safe.chainId])

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
}

export default WalletProvider
