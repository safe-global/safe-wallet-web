import { useState, type ReactElement } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'
import CheckWallet from '@/components/common/CheckWallet'
import { useNotificationsRenewal } from '@/components/settings/PushNotifications/hooks/useNotificationsRenewal'
import { useIsNotificationsRenewalEnabled } from '@/components/settings/PushNotifications/hooks/useNotificationsTokenVersion'

const NotificationRenewal = (): ReactElement => {
  const { safe, safeLoaded } = useSafeInfo()
  const [isRegistering, setIsRegistering] = useState(false)
  const { renewNotifications, needsRenewal, numberChainsForRenewal } = useNotificationsRenewal()
  const isNotificationsRenewalEnabled = useIsNotificationsRenewalEnabled()

  if (!needsRenewal || !isNotificationsRenewalEnabled) {
    // No need to renew any Safe's notifications
    return <></>
  }

  const handeSignClick = async () => {
    setIsRegistering(true)
    await renewNotifications()
    setIsRegistering(false)
  }

  const message = `We’ve upgraded your notification experience. Sign ${safeLoaded || numberChainsForRenewal < 2 ? 'the message' : `${numberChainsForRenewal} messages`} now to keep receiving important updates seamlessly.`

  return (
    <>
      <Alert severity="warning">
        <Typography variant="body2" fontWeight={700} mb={1}>
          Signature needed
        </Typography>
        <Typography variant="body2">{message}</Typography>
      </Alert>
      <Box>
        <CheckWallet allowNonOwner checkNetwork={!isRegistering && safe.deployed}>
          {(isOk) => (
            <Button
              variant="contained"
              size="small"
              sx={{ width: '200px' }}
              onClick={handeSignClick}
              disabled={!isOk || isRegistering || !safe.deployed}
            >
              Sign now
            </Button>
          )}
        </CheckWallet>
      </Box>
    </>
  )
}

export default NotificationRenewal
