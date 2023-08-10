import { Grid, Paper, Typography, Button } from '@mui/material'
import type { ReactElement } from 'react'

import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import CheckWallet from '@/components/common/CheckWallet'
import { requestNotificationPermission, registerSafe, _unregisterSafe } from './logic'
import type { RegisterDeviceDto } from './logic'

// TODO: If we also want to display this on the "general" settings we will need to:
// - adjust the layout to list subscribed Safes with unregister buttons
// - add device removal route to gateway if we want it (it exists on Transaction Service)
// - update the below code accordingly

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

    const isGranted = await requestNotificationPermission()

    if (!isGranted) {
      return
    }

    const registration = await registerSafe(safe, web3, currentRegistration)

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
