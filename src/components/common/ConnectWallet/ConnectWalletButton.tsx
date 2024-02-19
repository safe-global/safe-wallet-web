import { Button } from '@mui/material'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

const ConnectWalletButton = ({
  onConnect,
  contained = true,
  text,
}: {
  onConnect?: () => void
  contained?: boolean
  text?: string
}): React.ReactElement => {
  const connectWallet = useConnectWallet()

  const handleConnect = () => {
    onConnect?.()
    connectWallet()
  }

  return (
    <Button
      onClick={handleConnect}
      variant={contained ? 'contained' : 'text'}
      size="small"
      disableElevation
      fullWidth
      sx={{ fontSize: ['12px', '13px'] }}
    >
      {text || 'Connect'}
    </Button>
  )
}

export default ConnectWalletButton
