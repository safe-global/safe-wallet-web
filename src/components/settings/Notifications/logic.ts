import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { getToken, getMessaging } from 'firebase/messaging'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { RegisterNotificationsRequest } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { Web3Provider } from '@ethersproject/providers'

import { FIREBASE_MESSAGING_SW_PATH, FIREBASE_VAPID_KEY } from '@/config/constants'
import packageJson from '../../../../package.json'

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

const getSafeRegistrationSignature = ({
  safes,
  web3,
  timestamp,
  deviceUuid,
  token,
}: {
  safes: Array<string>
  web3: Web3Provider
  timestamp: string
  deviceUuid: string
  token: string
}) => {
  const MESSAGE_PREFIX = 'gnosis-safe'

  const message = MESSAGE_PREFIX + timestamp + deviceUuid + token + safes.join('')
  const hashedMessage = keccak256(toUtf8Bytes(message))

  return web3.getSigner().signMessage(hashedMessage)
}

export const getRegisterDevicePayload = async ({
  safesToRegister,
  uuid,
  web3,
}: {
  safesToRegister: { [chainId: string]: Array<string> }
  uuid: string
  web3?: Web3Provider
}): Promise<RegisterNotificationsRequest> => {
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

  const timestamp = Math.floor(new Date().getTime() / 1000).toString()

  const safeRegistrations = await Promise.all(
    Object.entries(safesToRegister).map(async ([chainId, safeAddresses]) => {
      // Signature is only required for CONFIRMATION_REQUESTS
      const signature = web3
        ? await getSafeRegistrationSignature({ safes: safeAddresses, web3, deviceUuid: uuid, timestamp, token })
        : undefined

      return {
        chainId,
        safes: safeAddresses,
        signatures: signature ? [signature] : [],
      }
    }),
  )

  return {
    uuid: uuid,
    cloudMessagingToken: token,
    buildNumber: '0', // Required value, but does not exist on web
    bundle: location.origin,
    deviceType: DeviceType.WEB,
    version: packageJson.version,
    timestamp,
    safeRegistrations,
  }
}
