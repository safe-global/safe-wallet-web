import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { getToken, getMessaging } from 'firebase/messaging'
import { DeviceType } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { RegisterNotificationsRequest } from '@safe-global/safe-gateway-typescript-sdk/dist/types/notifications'
import type { Web3Provider } from '@ethersproject/providers'

import { FIREBASE_VAPID_KEY, initializeFirebase } from '@/services/firebase/app'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
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

  trackEvent(isGranted ? PUSH_NOTIFICATION_EVENTS.GRANT_PERMISSION : PUSH_NOTIFICATION_EVENTS.REJECT_PERMISSION)

  if (!isGranted) {
    alert('You must allow notifications to register your device.')
  }

  return isGranted
}

const getSafeRegistrationSignature = ({
  safeAddresses,
  web3,
  timestamp,
  uuid,
  token,
}: {
  safeAddresses: Array<string>
  web3: Web3Provider
  timestamp: string
  uuid: string
  token: string
}) => {
  const MESSAGE_PREFIX = 'gnosis-safe'

  const message = MESSAGE_PREFIX + timestamp + uuid + token + safeAddresses.join('')
  const hashedMessage = keccak256(toUtf8Bytes(message))

  return web3.getSigner().signMessage(hashedMessage)
}

export type NotifiableSafes = { [chainId: string]: Array<string> }

export const getRegisterDevicePayload = async ({
  safesToRegister,
  uuid,
  web3,
}: {
  safesToRegister: NotifiableSafes
  uuid: string
  web3: Web3Provider
}): Promise<RegisterNotificationsRequest> => {
  const BUILD_NUMBER = '0' // Required value, but does not exist on web
  const BUNDLE = 'safe'

  const [serviceWorkerRegistration] = await navigator.serviceWorker.getRegistrations()

  // Get Firebase token
  const app = initializeFirebase()
  const messaging = getMessaging(app)

  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
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
      // We require a signature for confirmation request notifications
      const signature = await getSafeRegistrationSignature({ safeAddresses, web3, uuid, timestamp, token })

      return {
        chainId,
        safes: safeAddresses,
        signatures: [signature],
      }
    }),
  )

  return {
    uuid,
    cloudMessagingToken: token,
    buildNumber: BUILD_NUMBER,
    bundle: BUNDLE,
    deviceType: DeviceType.WEB,
    version: packageJson.version,
    timestamp,
    safeRegistrations,
  }
}
