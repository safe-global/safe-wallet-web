import { useEffect, useState } from 'react'
import { useCurrentChain } from '@/services/useChains'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '../useSafeInfo'
import { initSafeSDK, setSafeSDK } from './safeCoreSDK'

export const useInitSafeCoreSDK = (): Error | null => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!safe || !chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }

    const safeSdk = initSafeSDK(wallet.provider, wallet.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch(setError)
  }, [chain, wallet, safe])

  return error
}
