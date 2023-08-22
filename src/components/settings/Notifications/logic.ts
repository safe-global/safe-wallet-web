import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { getToken, getMessaging } from 'firebase/messaging'
import { registerDevice, unregisterSafe as gatewayUnregisterSafe } from '@safe-global/safe-gateway-typescript-sdk'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { RegisterNotificationsRequest } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { Web3Provider } from '@ethersproject/providers'

import packageJson from '../../../../package.json'
import { FIREBASE_MESSAGING_SW_PATH, FIREBASE_VAPID_KEY } from '@/config/constants'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

// We store UUID locally to track device registration
export type NotificationRegistration = WithRequired<RegisterNotificationsRequest, 'uuid'>

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Notification.permission === 'granted') {
    return true
  }

  let permission: NotificationPermission | undefined

  try {
    permission = await Notification.requestPermission()
  } catch (e) {
    console.error('Error requesting notification permission', e)
  }

  const isGranted = permission === 'granted'

  if (!isGranted) {
    alert('You must allow notifications to register your device.')
  }

  return isGranted
}

const getTimestampWithoutMilliseconds = () => {
  return Math.floor(new Date().getTime() / 1000).toString()
}

export const createRegisterSafePayload = async (
  safe: SafeInfo,
  web3: Web3Provider,
  currentRegistration?: NotificationRegistration,
): Promise<NotificationRegistration | undefined> => {
  const MESSAGE_PREFIX = 'gnosis-safe'

  const currentChainSafeRegistrations = currentRegistration?.safeRegistrations.find(
    (registration) => registration.chainId === safe.chainId,
  )?.safes

  const safeAddress = safe.address.value

  // Safe is already registered
  if (currentChainSafeRegistrations?.includes(safeAddress)) {
    return currentRegistration
  }

  const swRegistration = await navigator.serviceWorker.getRegistration(FIREBASE_MESSAGING_SW_PATH)

  // Get Firebase token
  const messaging = getMessaging()
  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  })

  // If uuid is not provided a new device will be created.
  // If a uuid for an existing Safe is provided the FirebaseDevice will be updated with all the new data provided.
  // Safes provided on the request are always added and never removed/replaced
  // Signature must sign `keccack256('gnosis-safe{timestamp-epoch}{uuid}{cloud_messaging_token}{safes_sorted}':
  //   - `{timestamp-epoch}` must be an integer (no milliseconds)
  //   - `{safes_sorted}` must be checksummed safe addresses sorted and joined with no spaces

  // @see https://github.com/safe-global/safe-transaction-service/blob/3644c08ac4b01b6a1c862567bc1d1c81b1a8c21f/safe_transaction_service/notifications/views.py#L19-L24

  const timestamp = getTimestampWithoutMilliseconds()
  const uuid = currentRegistration?.uuid ?? self.crypto.randomUUID()

  const safesToRegister = currentChainSafeRegistrations
    ? [...currentChainSafeRegistrations, safeAddress]
    : [safeAddress]

  const message = MESSAGE_PREFIX + timestamp + uuid + token + safesToRegister.join('')
  const hashedMessage = keccak256(toUtf8Bytes(message))

  const signature = await web3.getSigner().signMessage(hashedMessage)

  return {
    uuid,
    cloudMessagingToken: token,
    buildNumber: '0', // Required value, but does not exist on web
    bundle: location.origin,
    deviceType: DeviceType.WEB,
    version: packageJson.version,
    timestamp,
    safeRegistrations: [
      {
        chainId: safe.chainId,
        safes: safesToRegister,
        signatures: [signature],
      },
    ],
  }
}

export const registerSafe = async (
  safe: SafeInfo,
  web3: Web3Provider,
  currentRegistration?: NotificationRegistration,
): Promise<NotificationRegistration | undefined> => {
  let didRegister = false

  let payload: NotificationRegistration | undefined

  try {
    payload = await createRegisterSafePayload(safe, web3, currentRegistration)

    if (payload) {
      // Gateway will return 200 with an empty payload if the device was registered successfully
      // @see https://github.com/safe-global/safe-client-gateway-nest/blob/27b6b3846b4ecbf938cdf5d0595ca464c10e556b/src/routes/notifications/notifications.service.ts#L29
      const response = await registerDevice(payload)

      didRegister = response != null
    }
  } catch (e) {
    console.error('Error registering Safe', e)
  }

  if (!didRegister) {
    alert('Unable to register Safe')
    return currentRegistration
  }

  return payload
}

export const unregisterSafe = async (
  safe: SafeInfo,
  currentRegistration: NotificationRegistration,
): Promise<NotificationRegistration> => {
  let didUnregister = false

  try {
    const response = await gatewayUnregisterSafe(safe.chainId, safe.address.value, currentRegistration.uuid)

    didUnregister = response != null
  } catch (e) {
    console.error('Error unregistering Safe', e)
  }

  if (!didUnregister) {
    alert('Unable to unregister Safe')
    return currentRegistration
  }

  // Remove deleted Safe from registration and clear signatures
  const updatedSafeRegistrations = currentRegistration.safeRegistrations.map((registration) => {
    if (registration.chainId !== safe.chainId) {
      return registration
    }

    const updatedSafes = registration.safes.filter((safeAddress) => safeAddress !== safe.address.value)

    return {
      ...registration,
      safes: updatedSafes,
      signatures: [],
    }
  })

  return {
    ...currentRegistration,
    timestamp: getTimestampWithoutMilliseconds(),
    safeRegistrations: updatedSafeRegistrations,
  }
}
