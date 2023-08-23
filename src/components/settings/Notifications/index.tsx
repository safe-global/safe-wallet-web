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
      {safeLoaded && (
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item sm={4} xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs>
              {/* TODO: Confirm order */}
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.INCOMING_ETHER] && preferences[WebhookType.INCOMING_TOKEN]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.INCOMING_ETHER]: checked,
                          [WebhookType.INCOMING_TOKEN]: checked,
                        }))
                      }}
                    />
                  }
                  label="Incoming assets"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.OUTGOING_ETHER] && preferences[WebhookType.OUTGOING_TOKEN]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.OUTGOING_ETHER]: checked,
                          [WebhookType.OUTGOING_TOKEN]: checked,
                        }))
                      }}
                    />
                  }
                  label="Outgoing assets"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.PENDING_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.PENDING_MULTISIG_TRANSACTION]: checked,
                        }))
                      }}
                    />
                  }
                  label="Pending transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.CONFIRMATION_REQUEST]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.CONFIRMATION_REQUEST]: checked,
                        }))
                      }}
                    />
                  }
                  label="Confirmation requests"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.NEW_CONFIRMATION]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.NEW_CONFIRMATION]: checked,
                        }))
                      }}
                    />
                  }
                  label="New confirmations"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.EXECUTED_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: checked,
                        }))
                      }}
                    />
                  }
                  label="Executed transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.MODULE_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences((prev) => ({
                          ...prev,
                          [WebhookType.MODULE_TRANSACTION]: checked,
                        }))
                      }}
                    />
                  }
                  label="Module transactions"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  )
}
