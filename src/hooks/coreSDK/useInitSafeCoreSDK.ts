import { useEffect } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initReadOnlySafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { trackError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'

export const useInitSafeCoreSDK = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!safeLoaded || !safe.version) {
      // If we don't reset the SDK, a previous Safe could remain in the store
      setSafeSDK(undefined)
      return
    }

    initReadOnlySafeSDK(safe.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch((e) => {
        dispatch(
          showNotification({
            message: 'There was an error. Please try to reload the page.',
            groupKey: 'core-sdk-init-error',
            variant: 'error',
            detailedMessage: (e as Error).message,
          }),
        )
        trackError(ErrorCodes._105, (e as Error).message)
      })
  }, [safe.chainId, safe.address.value, safe.version, safeLoaded, dispatch])
}
