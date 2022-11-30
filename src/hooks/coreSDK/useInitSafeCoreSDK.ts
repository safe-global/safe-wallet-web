import { useEffect } from 'react'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initSafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { trackError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'

export const useInitSafeCoreSDK = () => {
  const wallet = useWallet()
  const { safe, safeLoaded } = useSafeInfo()

  useEffect(() => {
    if (!safeLoaded || !wallet?.provider || safe.chainId !== wallet.chainId) {
      // If we don't reset the SDK, a previous Safe could remain in the store
      setSafeSDK(undefined)
      return
    }

    initSafeSDK(wallet.provider, safe.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch((e) => {
        trackError(ErrorCodes._105, (e as Error).message)
      })
  }, [wallet?.provider, wallet?.chainId, safe.chainId, safe.address.value, safe.version, safeLoaded])
}
