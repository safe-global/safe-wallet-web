import { useEffect, useState } from 'react'
import { getWeb3, setSafeSDK } from '@/services/web3'
import useSafeAddress from '@/services/useSafeAddress'
import useSafeInfo from './useSafeInfo'

export const useWalletAddress = (): string | undefined => {
  const [walletAddress, setWalletAddress] = useState<string>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWalletAddress((window as any).ethereum?.selectedAddress)
    }
  }, [])

  return walletAddress
}

export const useInitSafeSDK = () => {
  const { address, chainId } = useSafeAddress()
  const { safe } = useSafeInfo()
  const { version } = safe
  const walletAddress = useWalletAddress()
  const web3 = getWeb3()

  useEffect(() => {
    if (!web3 || !walletAddress) return

    setSafeSDK(walletAddress, chainId, address, version)
  }, [walletAddress, chainId, address, version, web3])
}
