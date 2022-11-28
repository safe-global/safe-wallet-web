import { useEffect, useState } from 'react'
import useChainId from '@/hooks/useChainId'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initSafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

export const useInitSafeCoreSDK = (): Error | null => {
  const chainId = useChainId()
  const wallet = useWallet()
  const { safe, safeLoaded } = useSafeInfo()

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (
      !safeLoaded ||
      !wallet?.provider ||
      !wallet.chainId ||
      chainId !== wallet.chainId ||
      safe.chainId !== wallet.chainId
    ) {
      return
    }

    initSafeSDK(wallet.provider, wallet.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch((e) => {
        // If we don't reset the SDK, a previous Safe could remain in the store
        setSafeSDK(undefined)
        setError(e)
      })
  }, [chainId, wallet?.provider, wallet?.chainId, safe, safeLoaded])

  return error
}
