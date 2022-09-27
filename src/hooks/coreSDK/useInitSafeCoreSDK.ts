import { useEffect, useState } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initSafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

export const useInitSafeCoreSDK = (): Error | null => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const { safe, safeLoaded } = useSafeInfo()

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!safeLoaded || !chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }

    initSafeSDK(wallet.provider, wallet.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch((e) => {
        // If we don't reset the SDK, a previous Safe could remain in the store
        setSafeSDK(undefined)
        setError(e)
      })
  }, [chain, wallet, safe, safeLoaded])

  return error
}
