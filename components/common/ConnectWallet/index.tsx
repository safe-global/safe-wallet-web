import { ReactElement } from 'react'
import { Box, Button } from '@mui/material'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import { shortenAddress } from '@/utils/formatters'

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
    <Box sx={{ color: 'text.primary' }}>
      {wallet.ens || shortenAddress(wallet.address)}

      <Button onClick={handleDisconnect} size="small" variant="text" sx={{ fontWeight: 'normal', marginLeft: 1 }}>
        Disconnect
      </Button>
    </Box>
  ) : (
    <Button onClick={handleConnect} variant="contained" size="small">
      Connect Wallet
    </Button>
  )
}

export default ConnectWallet
