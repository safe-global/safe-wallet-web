import { registerDevice, unregisterDevice, unregisterSafe } from '@safe-global/safe-gateway-typescript-sdk'

import { useWeb3 } from '@/hooks/wallets/web3'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { useNotificationPreferences } from './useNotificationPreferences'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { getRegisterDevicePayload } from '../logic'
import type { NotifiableSafes } from '../logic'

export const useNotificationRegistrations = (): {
  registerNotifications: (safesToRegister: NotifiableSafes, withSignature?: boolean) => Promise<void>
  unregisterSafeNotifications: (chainId: string, safeAddress: string) => Promise<void>
  unregisterChainNotifications: (chainId: string) => Promise<void>
} => {
  const dispatch = useAppDispatch()
  const web3 = useWeb3()

  const { uuid, _createPreferences, _deletePreferences, _clearPreferences } = useNotificationPreferences()

  const registerNotifications = async (safesToRegister: NotifiableSafes, withConfirmationRequests = false) => {
    if (!uuid) {
      return
    }

    let didRegister = false

    try {
      const payload = await getRegisterDevicePayload({
        uuid,
        safesToRegister,
        web3: withConfirmationRequests ? web3 : undefined,
      })

      // Gateway will return 200 with an empty payload if the device was registered successfully
      // @see https://github.com/safe-global/safe-client-gateway-nest/blob/27b6b3846b4ecbf938cdf5d0595ca464c10e556b/src/routes/notifications/notifications.service.ts#L29
      const response = await registerDevice(payload)

      didRegister = response == null
    } catch (e) {
      console.error(`Error registering Safe(s)`, e)
    }

    if (!didRegister) {
      return
    }

    _createPreferences(safesToRegister, withConfirmationRequests)

    const totalRegistered = Object.values(safesToRegister).reduce((acc, safeAddresses) => acc + safeAddresses.length, 0)

    trackEvent({
      ...PUSH_NOTIFICATION_EVENTS.REGISTER_SAFES,
      label: totalRegistered,
    })

    if (!withConfirmationRequests) {
      dispatch(
        showNotification({
          message: `You will now receive notifications for ${
            totalRegistered > 1 ? 'these Safe Accounts' : 'this Safe Account'
          } in your browser.`,
          variant: 'success',
          groupKey: 'notifications',
        }),
      )
    }
  }

  const unregisterNotifications = async (unregistrationFn: Promise<void>, callback: () => void) => {
    let didUnregister = false

    try {
      const response = await unregistrationFn

      didUnregister = response == null
    } catch (e) {
      console.error('Error unregistering', e)
    }

    if (!didUnregister) {
      return
    }

    callback()
  }

  const unregisterSafeNotifications = async (chainId: string, safeAddress: string) => {
    if (uuid) {
      await unregisterNotifications(unregisterSafe(chainId, safeAddress, uuid), () => {
        _deletePreferences({ [chainId]: [safeAddress] })
        trackEvent(PUSH_NOTIFICATION_EVENTS.UNREGISTER_SAFE)
      })
    }
  }

  const unregisterChainNotifications = async (chainId: string) => {
    if (uuid) {
      await unregisterNotifications(unregisterDevice(chainId, uuid), () => {
        _clearPreferences()
        trackEvent(PUSH_NOTIFICATION_EVENTS.UNREGISTER_DEVICE)
      })
    }
  }

  return {
    registerNotifications,
    unregisterSafeNotifications,
    unregisterChainNotifications,
  }
}
