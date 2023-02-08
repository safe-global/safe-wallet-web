import { Box, Button, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import React from 'react'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import useWallet from '@/hooks/wallets/useWallet'

type Props = {
  children: ReactElement
}

const WalletConnectFence = ({ children, ...props }: Props) => {
  const handleConnect = useConnectWallet()
  const wallet = useWallet()
  return !!wallet ? (
    children
  ) : (
    <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box width={100} height={100} display="flex" alignItems="center" justifyContent="center">
        <KeyholeIcon />
      </Box>
      <Typography>Connect your wallet</Typography>

      <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
        Connect
      </Button>
    </Grid>
  )
}

export default WalletConnectFence
