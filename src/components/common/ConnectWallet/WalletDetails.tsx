import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import KeyholeIcon from '@/components/common/ConnectWallet/KeyholeIcon'
import { trackEvent } from '@/services/analytics'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return

    // We `trackEvent` instead of using `<Track>` as it impedes styling
    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    onConnect?.()
    onboard.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  return (
    <>
      <Typography variant="h5">Connect a wallet</Typography>

      <KeyholeIcon />

      <Button onClick={handleConnect} variant="contained" size="small" disableElevation fullWidth>
        Connect
      </Button>
    </>
  )
}

export default WalletDetails
