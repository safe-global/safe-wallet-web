import { useEffect } from 'react'
import { getWeb3, setSafeSDK } from 'utils/web3'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import useSafeAddress from 'services/useSafeAddress'

export const useSafeSDK = () => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { address } = useSafeAddress()
  const web3 = getWeb3()
  // TODO: Get from store
  const connectedWalletAddress = '0xd8BBcB76BC9AeA78972ED4773A5EB67B413f26A5'

  useEffect(() => {
    if (!web3) return

    setSafeSDK(connectedWalletAddress, address, safe.version)
  }, [connectedWalletAddress, address, safe.version, web3])
}
