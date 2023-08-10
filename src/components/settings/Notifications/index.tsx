import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { Grid, Paper, Typography, Button } from '@mui/material'
import { getToken, getMessaging } from 'firebase/messaging'
import type { ReactElement } from 'react'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import packageJson from '../../../../package.json'
import { FIREBASE_MESSAGING_SW_PATH, FIREBASE_VAPID_KEY, GATEWAY_URL_STAGING } from '@/config/constants'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import CheckWallet from '@/components/common/CheckWallet'

// TODO: If we also want to display this on the "general" settings we will need to:
// - adjust the layout to list subscribed Safes with unregister buttons
// - add device removal route to gateway if we want it (it exists on Transaction Service)
// - update the below code accordingly

export const _requestNotificationPermission = async (): Promise<boolean> => {
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

export const enum DeviceType {
  WEB = 'WEB',
}

export type RegisterDeviceDto = {
  uuid: string
  cloudMessagingToken: string
  buildNumber: string
  bundle: string
  deviceType: DeviceType
  version: string
  timestamp: string
  safeRegistrations: Array<{
    chainId: string
    safes: Array<string>
    signatures: Array<string>
  }>
}

export const _createRegisterSafePayload = async (
  safe: SafeInfo,
  web3: Web3Provider,
  currentRegistration?: RegisterDeviceDto,
): Promise<RegisterDeviceDto | undefined> => {
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

  const timestamp = Math.floor(new Date().getTime() / 1000).toString()
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

export const _registerSafe = async (
  safe: SafeInfo,
  web3: Web3Provider,
  currentRegistration?: RegisterDeviceDto,
): Promise<RegisterDeviceDto | undefined> => {
  const SAFE_REGISTRATION_ENDPOINT = `${GATEWAY_URL_STAGING}/v1/register/notifications`

  let didRegister = false

  let payload: RegisterDeviceDto | undefined

  try {
    payload = await _createRegisterSafePayload(safe, web3, currentRegistration)

    const response = await fetch(SAFE_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // Gateway will return 200 if the device was registered successfully
    // @see https://github.com/safe-global/safe-client-gateway-nest/blob/27b6b3846b4ecbf938cdf5d0595ca464c10e556b/src/routes/notifications/notifications.service.ts#L29
    didRegister = response.ok && response.status === 200
  } catch (e) {
    console.error('Error registering Safe', e)
  }

  if (!didRegister) {
    alert('Unable to register Safe.')
    return currentRegistration
  }

  return payload
}

export const _unregisterSafe = async (
  safe: SafeInfo,
  currentRegistration: RegisterDeviceDto,
): Promise<RegisterDeviceDto> => {
  const SAFE_UNREGISTRATION_ENDPOINT = `${GATEWAY_URL_STAGING}/v1/chains/${safe.chainId}/notifications/devices/${currentRegistration.uuid}/safes/${safe.address.value}`

  let didUnregister = false

  try {
    const response = await fetch(SAFE_UNREGISTRATION_ENDPOINT, {
      method: 'DELETE',
    })

    didUnregister = response.ok && response.status === 200
  } catch (e) {
    console.error('Error unregistering Safe', e)
  }

  if (!didUnregister) {
    alert('Unable to unregister Safe.')
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
    safeRegistrations: updatedSafeRegistrations,
  }
}

const FIREBASE_LS_KEY = 'firebase'

export const Notifications = (): ReactElement => {
  const web3 = useWeb3()
  const { safe } = useSafeInfo()

  const [currentRegistration, setCurrentRegistration] = useLocalStorage<RegisterDeviceDto | undefined>(FIREBASE_LS_KEY)

  const isCurrentSafeRegistered = currentRegistration?.safeRegistrations?.some((registration) => {
    return registration.safes.includes(safe.address.value)
  })

  const handleRegister = async () => {
    if (!web3) {
      return
    }

    const isGranted = await _requestNotificationPermission()

    if (!isGranted) {
      return
    }

    const registration = await _registerSafe(safe, web3, currentRegistration)

    if (registration) {
      setCurrentRegistration(registration)
    }
  }

  const handleUnregister = async () => {
    if (!currentRegistration) {
      return
    }

    const unregisteration = await _unregisterSafe(safe, currentRegistration)

    if (unregisteration) {
      setCurrentRegistration(undefined)
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item sm={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Push notifications
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={3}>
            {isCurrentSafeRegistered
              ? 'You are currently opt-in to receive notifications about this Safe on your device.'
              : 'You can register to see notifications about this Safe on your device. To register, you will have to sign a message to verify that you are the owner of this Safe.'}
            <br />
            <br />
            Please note that registration is per-browser and you will need to register again if you clear your browser
            cache.
          </Typography>
          {isCurrentSafeRegistered ? (
            <Button variant="contained" color="primary" onClick={handleUnregister} disabled>
              Unregister
            </Button>
          ) : (
            <CheckWallet>
              {(isOk) => (
                <Button variant="contained" color="primary" onClick={handleRegister} disabled={!isOk}>
                  Register
                </Button>
              )}
            </CheckWallet>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}
