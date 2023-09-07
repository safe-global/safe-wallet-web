import {
  Grid,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Switch,
  Divider,
  Link as MuiLink,
} from '@mui/material'
import Link from 'next/link'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/service-workers/firebase-messaging/webhook-types'
import { useNotificationRegistrations } from './hooks/useNotificationRegistrations'
import { useNotificationPreferences } from './hooks/useNotificationPreferences'
import { GlobalPushNotifications } from './GlobalPushNotifications'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { IS_DEV } from '@/config/constants'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { AppRoutes } from '@/config/routes'
import CheckWallet from '@/components/common/CheckWallet'

import css from './styles.module.css'

export const PushNotifications = (): ReactElement => {
  const dispatch = useAppDispatch()
  const { safe, safeLoaded } = useSafeInfo()
  const isOwner = useIsSafeOwner()

  const { updatePreferences, getPreferences, getAllPreferences } = useNotificationPreferences()
  const { unregisterSafeNotifications, unregisterChainNotifications, registerNotifications } =
    useNotificationRegistrations()

  const preferences = getPreferences(safe.chainId, safe.address.value)

  const setPreferences = (newPreferences: NonNullable<ReturnType<typeof getPreferences>>) => {
    updatePreferences(safe.chainId, safe.address.value, newPreferences)
  }

  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')
  const shouldShowMacHelper = isMac || IS_DEV

  const handleOnChange = async () => {
    if (!preferences) {
      await registerNotifications({ [safe.chainId]: [safe.address.value] })
      trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_SAFE)
      return
    }

    const allPreferences = getAllPreferences()
    const totalRegisteredSafesOnChain = allPreferences
      ? Object.values(allPreferences).filter(({ chainId }) => chainId === safe.chainId).length
      : 0
    const shouldUnregisterDevice = totalRegisteredSafesOnChain === 1

    if (shouldUnregisterDevice) {
      await unregisterChainNotifications(safe.chainId)
    } else {
      await unregisterSafeNotifications(safe.chainId, safe.address.value)
    }

    trackEvent(PUSH_NOTIFICATION_EVENTS.DISABLE_SAFE)
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
                Enable push notifications for {safeLoaded ? 'this Safe Account' : 'your Safe Accounts'} in your browser
                with your signature. You will need to enable them again if you clear your browser cache.
              </Typography>

              {shouldShowMacHelper && (
                <Alert severity="info" className={css.macOsInfo}>
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
                    <CheckWallet>
                      {(isOk) => (
                        <FormControlLabel
                          control={<Switch checked={!!preferences} onChange={handleOnChange} />}
                          label={preferences ? 'On' : 'Off'}
                          disabled={!isOk}
                        />
                      )}
                    </CheckWallet>
                  </div>

                  <Paper className={css.globalInfo} variant="outlined">
                    <Typography variant="body2">
                      Want to setup notifications for different or all Safes? You can do so in your{' '}
                      <Link href={AppRoutes.settings.notifications} passHref legacyBehavior>
                        <MuiLink>global preferences</MuiLink>
                      </Link>
                      .
                    </Typography>
                  </Paper>
                </>
              ) : (
                <GlobalPushNotifications />
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
                      checked={preferences[WebhookType.INCOMING_ETHER] && preferences[WebhookType.INCOMING_TOKEN]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.INCOMING_ETHER]: checked,
                          [WebhookType.INCOMING_TOKEN]: checked,
                        })

                        trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_INCOMING_TXS, label: checked })
                      }}
                    />
                  }
                  label="Incoming transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        preferences[WebhookType.OUTGOING_ETHER] &&
                        preferences[WebhookType.OUTGOING_TOKEN] &&
                        preferences[WebhookType.MODULE_TRANSACTION] &&
                        preferences[WebhookType.EXECUTED_MULTISIG_TRANSACTION] &&
                        preferences[WebhookType.PENDING_MULTISIG_TRANSACTION]
                      }
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.OUTGOING_ETHER]: checked,
                          [WebhookType.OUTGOING_TOKEN]: checked,
                          [WebhookType.MODULE_TRANSACTION]: checked,
                          [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: checked,
                          [WebhookType.PENDING_MULTISIG_TRANSACTION]: checked,
                        })

                        trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_OUTGOING_TXS, label: checked })
                      }}
                    />
                  }
                  label="Outgoing transactions"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.NEW_CONFIRMATION]}
                      onChange={(_, checked) => {
                        setPreferences({
                          ...preferences,
                          [WebhookType.NEW_CONFIRMATION]: checked,
                        })

                        trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_NEW_CONFIRMATION, label: checked })
                      }}
                    />
                  }
                  label="New confirmations"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[WebhookType.CONFIRMATION_REQUEST]}
                      onChange={async (_, checked) => {
                        registerNotifications({
                          [safe.chainId]: [safe.address.value],
                        })
                          .then(() => {
                            setPreferences({
                              ...preferences,
                              [WebhookType.CONFIRMATION_REQUEST]: checked,
                            })

                            trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_CONFIRMATION_REQUEST, label: checked })

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
                      {!preferences[WebhookType.CONFIRMATION_REQUEST] && (
                        <Typography color="text.secondary" variant="body2">
                          {isOwner ? 'Requires your signature' : 'Only owners'}
                        </Typography>
                      )}
                    </>
                  }
                  disabled={!isOwner || !preferences}
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Paper>
      )}
    </>
  )
}
