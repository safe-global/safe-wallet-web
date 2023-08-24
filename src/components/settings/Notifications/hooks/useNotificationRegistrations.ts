import { registerDevice, unregisterDevice, unregisterSafe } from '@safe-global/safe-gateway-typescript-sdk'

import { useWeb3 } from '@/hooks/wallets/web3'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { getRegisterDevicePayload } from '../logic'
import { useNotificationPreferences } from './useNotificationPreferences'

type Subscriptions = { [chainId: string]: Array<string> }

export const useNotificationRegistrations = () => {
  const dispatch = useAppDispatch()
  const web3 = useWeb3()

  const { uuid, _createPreferences, _deletePreferences, _clearPreferences } = useNotificationPreferences()

  const registerNotifications = async (safesToRegister: Subscriptions, withSignature = false) => {
    if (!uuid) {
      return
    }

    let didRegister = false

    try {
      const payload = await getRegisterDevicePayload({
        uuid,
        safesToRegister,
        web3: withSignature ? web3 : undefined,
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

    _createPreferences(safesToRegister)

    if (!withSignature) {
      const isMultiple =
        Object.keys(safesToRegister).length > 1 || Object.values(safesToRegister).some((safes) => safes.length > 1)

      dispatch(
        showNotification({
          message: `You will now receive notifications for ${
            isMultiple ? 'these Safe Accounts' : 'this Safe Account'
          } in your browser.`,
          variant: 'success',
          groupKey: 'notifications',
        }),
      )
    }
  }

  const unregisterSafeNotifications = async (chainId: string, safeAddress: string) => {
    if (!uuid) {
      return
    }

    let didUnregister = false

    try {
      const response = await unregisterSafe(chainId, safeAddress, uuid)

      didUnregister = response == null
    } catch (e) {
      console.error(`Error unregistering ${safeAddress} on chain ${chainId}`, e)
    }

    if (didUnregister) {
      _deletePreferences({ [chainId]: [safeAddress] })
    }
  }

  const unregisterAllNotifications = () => {
    if (!uuid) {
      return
    }

    // Device unregistration is chain agnostic
    unregisterDevice('1', uuid)
      .then(() => {
        _clearPreferences()
      })
      .catch(() => null)
  }

  return {
    registerNotifications,
    unregisterSafeNotifications,
    unregisterAllNotifications,
  }
}
