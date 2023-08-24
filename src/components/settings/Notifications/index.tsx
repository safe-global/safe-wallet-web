import { Grid, Paper, Typography, Checkbox, FormControlLabel, FormGroup, Alert, Switch, Divider } from '@mui/material'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/services/firebase/webhooks'
import { useNotificationRegistrations } from './hooks/useNotificationRegistrations'
import { useNotificationPreferences } from './hooks/useNotificationPreferences'
import { GlobalNotifications } from './GlobalNotifications'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { IS_DEV } from '@/config/constants'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'

import css from './styles.module.css'

export const SafeNotifications = (): ReactElement => {
  const dispatch = useAppDispatch()
  const { safe, safeLoaded } = useSafeInfo()
  const isOwner = useIsSafeOwner()

  const { getPreferences, updatePreferences } = useNotificationPreferences()
  const { unregisterSafeNotifications, registerNotifications } = useNotificationRegistrations()

  const preferences = getPreferences(safe.chainId, safe.address.value)

  const setPreferences = (newPreferences: NonNullable<ReturnType<typeof getPreferences>>) => {
    updatePreferences(safe.chainId, safe.address.value, newPreferences)
  }

  const isSafeRegistered = !!preferences

  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')
  const shouldShowMacHelper = isMac || IS_DEV

  const handleOnChange = () => {
    if (isSafeRegistered) {
      unregisterSafeNotifications(safe.chainId, safe.address.value)
    } else {
      registerNotifications({ [safe.chainId]: [safe.address.value] })
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
                Enable push notifications for {safeLoaded ? 'this Safe Account' : 'your Safe Accounts'} in your browser.
                You will need to enable them again if you clear your browser cache.
              </Typography>

              {shouldShowMacHelper && (
                <Alert severity="info" className={css.info}>
                  <Typography fontWeight={700} variant="body2" mb={1}>
                    For MacOS users
                  </Typography>
                  <Typography variant="body2">
                    Double-check that you have enabled your browser notifications under <b>System Settings</b> &gt;{' '}
                    <b>Notifications</b> &gt; <b>Application Notifications</b> (path may vary depending on OS version).
                  </Typography>
                </Alert>
              )}

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
                    <FormControlLabel
                      control={<Switch checked={!!isSafeRegistered} onChange={handleOnChange} />}
                      label={!!isSafeRegistered ? 'On' : 'Off'}
                    />
                  </div>
                </>
              ) : (
                <GlobalNotifications />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {preferences && (
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item sm={4} xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Notification
              </Typography>
            </Grid>

            <Grid item xs>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.INCOMING_ETHER] && preferences?.[WebhookType.INCOMING_TOKEN]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.INCOMING_ETHER]: checked,
                          [WebhookType.INCOMING_TOKEN]: checked,
                        })
                      }}
                    />
                  }
                  label="Incoming assets"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.OUTGOING_ETHER] && preferences?.[WebhookType.OUTGOING_TOKEN]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.OUTGOING_ETHER]: checked,
                          [WebhookType.OUTGOING_TOKEN]: checked,
                        })
                      }}
                    />
                  }
                  label="Outgoing assets"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.PENDING_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.PENDING_MULTISIG_TRANSACTION]: checked,
                        })
                      }}
                    />
                  }
                  label="Pending transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.NEW_CONFIRMATION]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.NEW_CONFIRMATION]: checked,
                        })
                      }}
                    />
                  }
                  label="New confirmations"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.EXECUTED_MULTISIG_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: checked,
                        })
                      }}
                    />
                  }
                  label="Executed transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.MODULE_TRANSACTION]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.MODULE_TRANSACTION]: checked,
                        })
                      }}
                    />
                  }
                  label="Module transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences?.[WebhookType.CONFIRMATION_REQUEST]}
                      onChange={async (_, checked) => {
                        registerNotifications(
                          {
                            [safe.chainId]: [safe.address.value],
                          },
                          true, // Add signature
                        )
                          .then(() => {
                            setPreferences({
                              ...preferences,
                              [WebhookType.CONFIRMATION_REQUEST]: checked,
                            })

                            dispatch(
                              showNotification({
                                message:
                                  'You will now receive notifications about confirmation requests for this Safe Account in your browser.',
                                variant: 'success',
                                groupKey: 'notifications',
                              }),
                            )
                          })
                          .catch(() => null)
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
