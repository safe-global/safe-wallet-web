import { Grid, Paper, Typography, Checkbox, FormControlLabel, FormGroup, Alert, Switch, Divider } from '@mui/material'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import CheckWallet from '@/components/common/CheckWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/services/firebase/webhooks'
import { useNotificationDb } from './useNotificationDb'
import { AllSafesNotifications } from './AllSafesNotifications'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { registerNotificationDevice, unregisterSafeNotifications } from './logic'
import { useWeb3 } from '@/hooks/wallets/web3'

import css from './styles.module.css'

export const Notifications = (): ReactElement => {
  const web3 = useWeb3()
  const { safe, safeLoaded } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const {
    deviceUuid,
    isSafeRegistered,
    notificationPreferences,
    setNotificationPreferences,
    registerSafeLocally,
    unregisterSafeLocally,
  } = useNotificationDb()

  const handleOnChange = () => {
    if (isSafeRegistered) {
      unregisterSafeNotifications({
        deviceUuid,
        chainId: safe.chainId,
        safeAddress: safe.address.value,
        callback: () => unregisterSafeLocally(safe.chainId, safe.address.value),
      })
    } else {
      registerNotificationDevice({
        deviceUuid,
        safesToRegister: { [safe.chainId]: [safe.address.value] },
        callback: () => registerSafeLocally(safe.chainId, safe.address.value),
      })
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

          <Grid item xs>
            <Grid container gap={2.5} flexDirection="column">
              <Typography>
                {isSafeRegistered
                  ? 'You will receive notifications about this Safe Account in this browser.'
                  : `Subscribe to receive notifications about ${
                      safeLoaded ? 'this Safe Account' : 'Safe Accounts'
                    } in this browser.`}
              </Typography>

              <Alert severity="info" className={css.info}>
                Please note that registration is per-browser and you will need to register again if you clear your
                browser cache.
              </Alert>

              {safeLoaded ? (
                <>
                  <Divider />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <EthHashInfo
                      address={safe.address.value}
                      showCopyButton
                      shortAddress={false}
                      showName={true}
                      hasExplorer
                    />
                    <CheckWallet>
                      {(isOk) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!isSafeRegistered}
                              onChange={handleOnChange}
                              disabled={!isOk}
                              className={css.switch}
                            />
                          }
                          label={!!isSafeRegistered ? 'On' : 'Off'}
                        />
                      )}
                    </CheckWallet>
                  </div>
                </>
              ) : (
                <AllSafesNotifications />
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
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        notificationPreferences[WebhookType.INCOMING_ETHER] &&
                        notificationPreferences[WebhookType.INCOMING_TOKEN]
                      }
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.INCOMING_ETHER]: checked,
                          [WebhookType.INCOMING_TOKEN]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="Incoming assets"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        notificationPreferences[WebhookType.OUTGOING_ETHER] &&
                        notificationPreferences[WebhookType.OUTGOING_TOKEN]
                      }
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.OUTGOING_ETHER]: checked,
                          [WebhookType.OUTGOING_TOKEN]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="Outgoing assets"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationPreferences[WebhookType.PENDING_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.PENDING_MULTISIG_TRANSACTION]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="Pending transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationPreferences[WebhookType.NEW_CONFIRMATION]}
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.NEW_CONFIRMATION]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="New confirmations"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationPreferences[WebhookType.EXECUTED_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="Executed transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationPreferences[WebhookType.MODULE_TRANSACTION]}
                      onChange={(_, checked) => {
                        setNotificationPreferences({
                          ...notificationPreferences,
                          [WebhookType.MODULE_TRANSACTION]: checked,
                        })
                      }}
                      disabled={!isSafeRegistered}
                    />
                  }
                  label="Module transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notificationPreferences[WebhookType.CONFIRMATION_REQUEST]}
                      onChange={(_, checked) => {
                        registerNotificationDevice({
                          deviceUuid,
                          safesToRegister: {
                            [safe.chainId]: [safe.address.value],
                          },
                          web3, // Add signature
                          callback: () =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              [WebhookType.CONFIRMATION_REQUEST]: checked,
                            }),
                        })
                      }}
                    />
                  }
                  label={
                    <>
                      <Typography>Confirmation requests</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {isOwner ? 'Requires your signature' : 'Only owners'}
                      </Typography>
                    </>
                  }
                  disabled={!isOwner || !isSafeRegistered}
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  )
}
