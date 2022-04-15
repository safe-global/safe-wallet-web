import { useEffect, useState } from 'react'
import { getWeb3, setSafeSDK } from 'utils/web3'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import useSafeAddress from 'services/useSafeAddress'

const useWalletAddress = (): string | undefined => {
  const [walletAddress, setWalletAddress] = useState<string>()

  useEffect(() => {
    if (typeof window !== undefined) {
      setWalletAddress((window as any).ethereum?.selectedAddress)
    }
  }, [])

  return walletAddress
}

export const useSafeSDK = () => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { address, chainId } = useSafeAddress()
  const walletAddress = useWalletAddress()
  const web3 = getWeb3()

  useEffect(() => {
    if (!web3 || !walletAddress) return

    setSafeSDK(walletAddress, chainId, address, safe.version)
  }, [walletAddress, chainId, address, safe.version, web3])
}
