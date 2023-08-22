import {
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  SvgIcon,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material'
import DeleteIcon from '@/public/images/common/delete.svg'
import { useCallback, useMemo } from 'react'
import type { ReactElement } from 'react'

import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import { requestNotificationPermission, registerSafe, unregisterSafe } from '@/components/settings/Notifications/logic'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/services/firebase/webhooks'
import { useNotificationPreferences } from './useNotificationPreferences'
import type { NotificationRegistration } from '@/components/settings/Notifications/logic'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

const FIREBASE_LS_KEY = 'firebase'

const headCells = [
  { id: 'safe', label: 'Safe' },
  { id: 'actions', label: '', sticky: true },
]

export const Notifications = (): ReactElement => {
  const web3 = useWeb3()
  const { safe } = useSafeInfo()
  const [preferences, setPreferences] = useNotificationPreferences()

  const [currentRegistration, setCurrentRegistration] = useLocalStorage<NotificationRegistration | undefined>(
    FIREBASE_LS_KEY,
  )

  const isCurrentSafeRegistered = currentRegistration?.safeRegistrations?.some((registration) => {
    return registration.safes.includes(safe.address.value)
  })

  const handleRegister = useCallback(async () => {
    if (!web3) {
      return
    }

    const isGranted = await requestNotificationPermission()

    if (!isGranted) {
      return
    }

    const registration = await registerSafe(safe, web3, currentRegistration)

    setCurrentRegistration(registration)
  }, [currentRegistration, safe, setCurrentRegistration, web3])

  const handleUnregister = useCallback(async () => {
    if (!currentRegistration) {
      return
    }

    const registration = await unregisterSafe(safe, currentRegistration)

    setCurrentRegistration(registration)
  }, [currentRegistration, safe, setCurrentRegistration])

  const rows = useMemo(() => {
    return currentRegistration?.safeRegistrations.flatMap(({ safes }) => {
      return safes.map((safeAddress) => {
        return {
          cells: {
            safe: {
              rawValue: safeAddress,
              content: (
                <EthHashInfo address={safeAddress} showCopyButton shortAddress={false} showName={true} hasExplorer />
              ),
            },
            actions: {
              rawValue: '',
              sticky: true,
              content: (
                <div className={tableCss.actions}>
                  <CheckWallet>
                    {(isOk) => (
                      <Tooltip title="Unregister">
                        <IconButton onClick={handleUnregister} size="small" disabled={!isOk}>
                          <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CheckWallet>
                </div>
              ),
            },
          },
        }
      })
    })
  }, [currentRegistration?.safeRegistrations, handleUnregister])

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
            <Typography mb={3}>
              {isCurrentSafeRegistered
                ? 'You will receive notifications about the following Safes on your device.'
                : `You can opt-in to see notifications about this Safe on your device. To do so, you have to sign a message to verify that you are an owner.`}
              <br />
              <br />
              Please note that registration is per-browser and you will need to register again if you clear your browser
              cache.
            </Typography>
            {!isCurrentSafeRegistered && (
              <CheckWallet>
                {(isOk) => (
                  <Button variant="contained" color="primary" onClick={handleRegister} disabled={!isOk}>
                    Register
                  </Button>
                )}
              </CheckWallet>
            )}

            {rows && <EnhancedTable rows={rows} headCells={headCells} />}
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
              {Object.values(WebhookType).map((type) => {
                return (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={preferences[type]}
                        onChange={(_, checked) => {
                          setPreferences({
                            ...preferences,
                            [type]: checked,
                          })
                        }}
                      />
                    }
                    label={type}
                  />
                )
              })}
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
