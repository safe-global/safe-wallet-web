import { useEffect } from 'react'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initSafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { trackError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'

export const useInitSafeCoreSDK = () => {
  const wallet = useWallet()
  const { safe, safeLoaded } = useSafeInfo()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!safeLoaded || !wallet?.provider || safe.chainId !== wallet.chainId || !safe.version) {
      // If we don't reset the SDK, a previous Safe could remain in the store
      setSafeSDK(undefined)
      return
    }

    initSafeSDK(wallet.provider, safe.chainId, safe.address.value, safe.version)
      .then(setSafeSDK)
      .catch((e) => {
        dispatch(
          showNotification({
            message: `The Safe SDK could not be initialized.`,
            groupKey: 'core-sdk-init-error',
            variant: 'error',
          }),
        )
        trackError(ErrorCodes._105, (e as Error).message)
      })
  }, [wallet?.provider, wallet?.chainId, safe.chainId, safe.address.value, safe.version, safeLoaded, dispatch])
}
