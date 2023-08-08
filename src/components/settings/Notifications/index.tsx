import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { Grid, Paper, Typography, Button } from '@mui/material'
import { getToken, getMessaging } from 'firebase/messaging'
import type { ReactElement } from 'react'

import packageJson from '../../../../package.json'
import { FIREBASE_VAPID_KEY, GATEWAY_URL_STAGING } from '@/config/constants'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useCurrentChain } from '@/hooks/useChains'
import EthHashInfo from '@/components/common/EthHashInfo'

const NOTIFICATIONS_LS_REGISTRATION_KEY = 'firebaseCloudMessaging'

const enum DeviceType {
  WEB = 'WEB',
}

type RegisterDeviceDto = {
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

const getFirebaseToken = async () => {
  const NEXT_PWA_SW_PATH = '/sw.js'

  const swRegistration = await navigator.serviceWorker.getRegistration(NEXT_PWA_SW_PATH)

  // Get token
  const messaging = getMessaging()
  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swRegistration,
  })

  console.log({ token })

  return token
}

export const Notifications = (): ReactElement => {
  const web3 = useWeb3()
  const { safe } = useSafeInfo()
  const chain = useCurrentChain()
  const [firebase, setFirebase] = useLocalStorage<RegisterDeviceDto | undefined>(NOTIFICATIONS_LS_REGISTRATION_KEY)

  const handleRegister = async () => {
    const DEVICE_REGISTRATION_ENDPOINT = `${GATEWAY_URL_STAGING}/v1/register/notifications`

    const MESSAGE_PREFIX = 'gnosis-safe'

    if (!web3) {
      return
    }

    // Request permission to show notifications if not already granted
    if (Notification.permission !== 'granted') {
      let permission: NotificationPermission | undefined

      try {
        permission = await Notification.requestPermission()
      } catch (e) {
        console.error('Error requesting notification permission', e)
      }

      if (permission !== 'granted') {
        alert('You must allow notifications to register your device.')
        return
      }
    }

    let didRegister = false

    // Create message to sign
    const timestamp = Math.floor(new Date().getTime() / 1000).toString()
    const uuid = firebase?.uuid ?? self.crypto.randomUUID()
    const safes = [safe.address.value]
    const token = await getFirebaseToken()

    const message = MESSAGE_PREFIX + timestamp + uuid + token + safes.join('')
    const hashedMessage = keccak256(toUtf8Bytes(message))

    let payload: RegisterDeviceDto | undefined

    // Register device
    try {
      const signature = await web3.getSigner().signMessage(hashedMessage)

      // TODO: Push to existing registrations?
      payload = {
        uuid,
        cloudMessagingToken: token,
        buildNumber: '0', // TODO: What do we add here?
        bundle: '.', // TODO: What do we add here?
        deviceType: DeviceType.WEB,
        version: packageJson.version,
        timestamp,
        safeRegistrations: [
          {
            chainId: safe.chainId,
            safes,
            signatures: [signature],
          },
        ],
      }

      const response = await fetch(DEVICE_REGISTRATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      // Gateway will return 200 if the device was registered successfully
      didRegister = response?.ok && response?.status === 200
    } catch (e) {
      console.error('Error registering device', e)
    }

    if (!didRegister) {
      alert('Unable to register device.')
    } else {
      setFirebase(payload)
    }
  }

  // TODO: Fix unregister
  const handleUnregister = async () => {
    if (!firebase) {
      return
    }

    // TODO: Implement on CGW as this is not yet implemented there
    const DEVICE_DELETE_ENDPOINT = `${chain?.transactionService}v1/notifications/devices/${firebase.uuid}`

    let didDelete = false

    try {
      const response = await fetch(DEVICE_DELETE_ENDPOINT, {
        method: 'DELETE',
      })

      console.log({ response: await response.json() })

      didDelete = response?.ok && response?.status === 200
    } catch (e) {
      console.error('Error registering device', e)
    }

    if (didDelete) {
      setFirebase(undefined)
    }
  }

  const registeredSafes = firebase?.safeRegistrations.map((safeRegistration) => safeRegistration.safes).flat()

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
            {firebase
              ? 'You are currently registered to receive notifications about your Safe(s) on this device.'
              : 'You can register to see notifications about your Safe(s) on this device. You will have to sign a message to verify that you are the owner of this Safe. Please note that you will need to register again if you clear your browser cache.'}
          </Typography>
          <button onClick={getFirebaseToken}>Log Firebase token</button>
          {registeredSafes && (
            <div>
              {registeredSafes.map((safe, i) => {
                return <EthHashInfo address={safe} shortAddress={false} showName hasExplorer showCopyButton key={i} />
              })}
            </div>
          )}
          {firebase ? (
            <Button variant="contained" color="primary" onClick={handleUnregister} disabled>
              Unregister
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleRegister} disabled={!web3}>
              Register
            </Button>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}
