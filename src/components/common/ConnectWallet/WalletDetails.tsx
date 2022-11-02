import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { trackEvent } from '@/services/analytics'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return

    // We `trackEvent` instead of using `<Track>` as it impedes styling
    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    const error = await connectWallet(onboard)
    if (error) return
    onConnect?.()
  }

  return (
    <>
      <Typography variant="h5">Connect a wallet</Typography>

      <KeyholeIcon />

      <Button onClick={handleConnect} variant="contained" disableElevation>
        Connect
      </Button>
    </>
  )
}

export default WalletDetails
