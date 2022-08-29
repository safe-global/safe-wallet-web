import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import Track from '@/components/common/Track'
import KeyholeIcon from '@/components/common/ConnectWallet/KeyholeIcon'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return
    onConnect?.()
    onboard.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  return (
    <>
      <Typography variant="h5">Connect a wallet</Typography>

      <KeyholeIcon height={40} width={40} />

      <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD}>
        <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
          Connect
        </Button>
      </Track>
    </>
  )
}

export default WalletDetails
