import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import { Button } from '@mui/material'
import { ConnectButton } from '@particle-network/connectkit'

const ConnectWalletButton = ({
  onConnect,
  contained = true,
  small = false,
  text,
}: {
  onConnect?: () => void
  contained?: boolean
  small?: boolean
  text?: string
}): React.ReactElement => {
  const connectWallet = useConnectWallet()

  const handleConnect = () => {
    onConnect?.()
    connectWallet()
  }

  return (
    <ConnectButton.Custom>
      {({ account, openConnectModal }) => {
        return (
          <div>
            {!account && (
              <Button
                data-sid="10294"
                onClick={openConnectModal}
                variant={contained ? 'contained' : 'text'}
                size={small ? 'small' : 'medium'}
                disableElevation
                fullWidth
                sx={{ fontSize: small ? ['12px', '13px'] : '' }}
              >
                {text || 'Connect'}
              </Button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default ConnectWalletButton
