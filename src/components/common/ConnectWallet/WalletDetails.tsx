import { Button, Divider, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import LockIcon from '@/public/images/common/lock.svg'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import MPCLogin from './MPCLogin'
import css from './styles.module.css'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const connectWallet = useConnectWallet()

  const handleConnect = () => {
    onConnect?.()
    connectWallet()
  }

  return (
    <>
      <LockIcon />

      <Button
        onClick={handleConnect}
        className={css.loginButton}
        variant="contained"
        size="small"
        disableElevation
        fullWidth
        sx={{ mt: 1 }}
      >
        Connect a wallet
      </Button>

      <Divider sx={{ width: '100%' }}>
        <Typography color="text.secondary" fontWeight={700} variant="overline">
          or
        </Typography>
      </Divider>

      <MPCLogin />
    </>
  )
}

export default WalletDetails
