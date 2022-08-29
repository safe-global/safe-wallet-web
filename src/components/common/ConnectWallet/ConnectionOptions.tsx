import { Divider, Typography, Button } from '@mui/material'
import type { ReactElement } from 'react'

import useOnboard from '@/hooks/wallets/useOnboard'
import PairingDetails from '@/components/common/PairingDetails'
import KeyholeIcon from '@/components/common/ConnectWallet/KeyholeIcon'
import { logError, Errors } from '@/services/exceptions'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'

const ConnectionOptions = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    onConnect?.()
    onboard?.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  return (
    <>
      <Typography variant="h5">Connect a wallet</Typography>

      <KeyholeIcon height={60} width={60} />

      <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD}>
        <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
          Connect
        </Button>
      </Track>

      <Divider flexItem />

      <PairingDetails />
    </>
  )
}

export default ConnectionOptions
