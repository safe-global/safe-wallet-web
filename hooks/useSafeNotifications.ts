import { useEffect } from 'react'
import { closeNotification, showNotification } from '@/store/notificationsSlice'
import { ImplementationVersionState } from '@gnosis.pm/safe-react-gateway-sdk'
import useSafeInfo from './useSafeInfo'
import { useAppDispatch } from '@/store'

/**
 * General-purpose notifications relating to the entire Safe
 */
const useSafeNotifications = (): void => {
  const dispatch = useAppDispatch()
  const { safe, safeAddress } = useSafeInfo()
  const { chainId, version, implementationVersionState } = safe

  // Show a notification when the Safe version is out of date
  useEffect(() => {
    if (implementationVersionState === ImplementationVersionState.OUTDATED) {
      const id = dispatch(
        showNotification({
          variant: 'warning',
          message: `Your Safe version ${version} is out of date. Please update it.`,
          groupKey: 'safe-outdated-version',
        }),
      )

      return () => {
        dispatch(closeNotification({ id }))
      }
    }
  }, [dispatch, chainId, safeAddress, implementationVersionState, version])
}

export default useSafeNotifications
