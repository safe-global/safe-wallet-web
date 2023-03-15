import { useEffect } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initReadOnlySafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { trackError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

export const useInitSafeCoreSDK = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const dispatch = useAppDispatch()
  const provider = useWeb3ReadOnly()

  useEffect(() => {
    if (!safeLoaded || !provider) {
      // If we don't reset the SDK, a previous Safe could remain in the store
      setSafeSDK(undefined)
      return
    }

    // A read-only instance of the SDK is sufficient because we connect the signer to it when needed
    initReadOnlySafeSDK(provider, safe)
      .then(setSafeSDK)
      .catch((e) => {
        dispatch(
          showNotification({
            message: 'Please try connecting your wallet again.',
            groupKey: 'core-sdk-init-error',
            variant: 'error',
            detailedMessage: (e as Error).message,
          }),
        )
        trackError(ErrorCodes._105, (e as Error).message)
      })
  }, [safe, safeLoaded, dispatch, provider])
}
