import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import type { ConnectedWallet } from '@/services/onboard'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

const WalletDetails = ({ onConnect }: { onConnect?: (wallet?: ConnectedWallet) => void }): ReactElement => {
  const handleConnect = useConnectWallet(onConnect)

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
