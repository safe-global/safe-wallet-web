import { Grid, Paper, Typography, Checkbox, FormControlLabel, FormGroup, Alert, Switch } from '@mui/material'
import type { ReactElement } from 'react'

import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import CheckWallet from '@/components/common/CheckWallet'
import { registerNotifications, unregisterSafe } from '@/components/settings/Notifications/logic'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/services/firebase/webhooks'
import { useNotificationPreferences } from './useNotificationPreferences'
import { AllSafesNotifications } from './AllSafesNotifications'
import type { NotificationRegistration } from '@/components/settings/Notifications/logic'

import css from './styles.module.css'

const FIREBASE_LS_KEY = 'firebase'

export const Notifications = (): ReactElement => {
  const web3 = useWeb3()
  const { safe, safeLoaded } = useSafeInfo()
  const [preferences, setPreferences] = useNotificationPreferences()

  const [currentRegistration, setCurrentRegistration] = useLocalStorage<NotificationRegistration | undefined>(
    FIREBASE_LS_KEY,
  )

  const currentSafeRegistration = currentRegistration?.safeRegistrations.find(({ safes }) => {
    return safes.includes(safe.address.value)
  })

  const handleRegister = async (safesToRegister: { [chainId: string]: Array<string> }) => {
    if (!web3) {
      return
    }

    const registration = await registerNotifications(safesToRegister, web3, currentRegistration)

    setCurrentRegistration(registration)
  }

  const handleUnregister = async () => {
    if (!currentRegistration) {
      return
    }

    const registration = await unregisterSafe(safe, currentRegistration)

    setCurrentRegistration(registration)
  }

  const handleOnChange = () => {
    if (currentSafeRegistration) {
      handleUnregister()
    } else {
      handleRegister({ [safe.chainId]: [safe.address.value] })
    }
  }

  return (
    <>
      <Paper sx={{ p: 4, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item sm={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Push notifications
            </Typography>
          </Grid>

          <Grid item>
            <Grid container gap={2.5} flexDirection="column">
              <Typography>
                {currentSafeRegistration
                  ? 'You will receive notifications about this Safe Account in this browser.'
                  : `Subscribe to receive notifications about ${
                      safeLoaded ? 'this Safe Account' : 'Safe Accounts'
                    } in this browser. To do so, you will have to sign a message to verify that you are an owner.`}
              </Typography>

              <Alert severity="info" className={css.info}>
                Please note that registration is per-browser and you will need to register again if you clear your
                browser cache.
              </Alert>

              {safeLoaded ? (
                <div style={{ display: 'flex' }}>
                  <CheckWallet>
                    {(isOk) => (
                      <Switch
                        checked={!!currentSafeRegistration}
                        onChange={handleOnChange}
                        disabled={!isOk}
                        className={css.switch}
                      />
                    )}
                  </CheckWallet>
                  <EthHashInfo
                    address={safe.address.value}
                    showCopyButton
                    shortAddress={false}
                    showName={true}
                    hasExplorer
                  />
                </div>
              ) : (
                <AllSafesNotifications currentRegistration={currentRegistration} handleRegister={handleRegister} />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item sm={4} xs={12}>
            <Typography variant="h4" fontWeight={700}>
              Preferences
            </Typography>
          </Grid>

          <Grid item xs>
            <FormGroup>
              {Object.values(WebhookType).map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={preferences[type]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [type]: checked,
                        }))
                      }}
                    />
                  }
                  label={type}
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
