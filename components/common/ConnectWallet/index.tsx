import { ReactElement } from 'react'
import { Button, Typography } from '@mui/material'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '../EthHashInfo'
import css from './styles.module.css'

const ConnectWallet = (): ReactElement => {
  const wallet = useWallet()
  const onboard = useOnboard()

  const handleConnect = () => {
    onboard?.connectWallet()
  }

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })
  }

  return wallet ? (
    <div className={css.connectedContainer}>
      <Typography fontSize="10px">
        <EthHashInfo address={wallet.address} name={wallet.ens} />
      </Typography>

      <Button onClick={handleDisconnect} size="small" variant="text" sx={{ fontWeight: 'normal', marginLeft: 1 }}>
        Disconnect
      </Button>
    </div>
  ) : (
    <Button onClick={handleConnect} variant="contained" size="small">
      Connect Wallet
    </Button>
  )
}

export default ConnectWallet
