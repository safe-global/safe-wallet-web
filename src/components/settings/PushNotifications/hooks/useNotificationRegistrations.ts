import { registerDevice, unregisterDevice, unregisterSafe } from '@safe-global/safe-gateway-typescript-sdk'

import { useWeb3 } from '@/hooks/wallets/web3'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { useNotificationPreferences } from './useNotificationPreferences'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { getRegisterDevicePayload } from '../logic'
import type { NotifiableSafes } from '../logic'

const registrationFlow = async (registrationFn: Promise<void>, callback: () => void) => {
  let success = false

  try {
    const response = await registrationFn

    // Gateway will return 200 with an empty payload if the device was (un-)registered successfully
    // @see https://github.com/safe-global/safe-client-gateway-nest/blob/27b6b3846b4ecbf938cdf5d0595ca464c10e556b/src/routes/notifications/notifications.service.ts#L29
    success = response == null
  } catch (e) {
    console.error('(Un-)registration error', e)
  }

  if (success) {
    callback()
  }
}
export const useNotificationRegistrations = (): {
  registerNotifications: (safesToRegister: NotifiableSafes, withSignature?: boolean) => Promise<void>
  unregisterSafeNotifications: (chainId: string, safeAddress: string) => Promise<void>
  unregisterChainNotifications: (chainId: string) => Promise<void>
} => {
  const dispatch = useAppDispatch()
  const web3 = useWeb3()

  const { uuid, _createPreferences, _deletePreferences, _clearPreferences } = useNotificationPreferences()

  const registerNotifications = async (safesToRegister: NotifiableSafes) => {
    if (!uuid || !web3) {
      return
    }

    const register = async () => {
      const payload = await getRegisterDevicePayload({
        uuid,
        safesToRegister,
        web3,
      })

      return registerDevice(payload)
    }

    await registrationFlow(register(), () => {
      _createPreferences(safesToRegister)

      const totalRegistered = Object.values(safesToRegister).reduce(
        (acc, safeAddresses) => acc + safeAddresses.length,
        0,
      )

      trackEvent({
        ...PUSH_NOTIFICATION_EVENTS.REGISTER_SAFES,
        label: totalRegistered,
      })

      dispatch(
        showNotification({
          message: `You will now receive notifications for ${
            totalRegistered > 1 ? 'these Safe Accounts' : 'this Safe Account'
          } in your browser.`,
          variant: 'success',
          groupKey: 'notifications',
        }),
      )
    })
  }

  const unregisterSafeNotifications = async (chainId: string, safeAddress: string) => {
    if (uuid) {
      await registrationFlow(unregisterSafe(chainId, safeAddress, uuid), () => {
        _deletePreferences({ [chainId]: [safeAddress] })
        trackEvent(PUSH_NOTIFICATION_EVENTS.UNREGISTER_SAFE)
      })
    }
  }

  const unregisterChainNotifications = async (chainId: string) => {
    if (uuid) {
      await registrationFlow(unregisterDevice(chainId, uuid), () => {
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
