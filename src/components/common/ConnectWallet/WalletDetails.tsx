import { Button, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const connectWallet = useConnectWallet()

  const handleConnect = () => {
    onConnect?.()
    connectWallet()
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
