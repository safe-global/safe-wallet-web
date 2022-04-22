import { useEffect } from 'react'

import { useOnboardState, getPrimaryWalletAddress } from '@/services/useOnboard'
import useSafeAddress from '@/services/useSafeAddress'
import useSafeInfo from '@/services/useSafeInfo'
import { setSafeSDK } from '@/services/web3'

export const useInitSafeSDK = () => {
  const wallets = useOnboardState('wallets')
  const { chainId, address } = useSafeAddress()
  const { safe } = useSafeInfo()

  useEffect(() => {
    if (!wallets?.length) {
      return
    }
    const walletAddress = getPrimaryWalletAddress(wallets)
    setSafeSDK(walletAddress, chainId, address, safe.version)
  }, [chainId, address, safe.version])
}
