import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { trackEvent } from '@/services/analytics'
import { CodedException } from '@/services/exceptions'
import type { ConnectedWallet } from '@/services/onboard'

const WalletDetails = ({ onConnect }: { onConnect?: (wallet?: ConnectedWallet) => void }): ReactElement => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return

    // We `trackEvent` instead of using `<Track>` as it impedes styling
    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    const result = await connectWallet(onboard)

    if (result instanceof CodedException) return

    onConnect?.(result)
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
