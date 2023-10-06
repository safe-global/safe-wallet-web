import { Button } from '@mui/material'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

const ConnectWalletButton = ({ onConnect }: { onConnect?: () => void }): React.ReactElement => {
  const connectWallet = useConnectWallet()

  const handleConnect = () => {
    onConnect?.()
    connectWallet()
  }

  return (
    <Button
      onClick={handleConnect}
      variant="contained"
      size="small"
      disableElevation
      fullWidth
      sx={{ fontSize: ['12px', '13px'] }}
    >
      Connect
    </Button>
  )
}

export default ConnectWalletButton
