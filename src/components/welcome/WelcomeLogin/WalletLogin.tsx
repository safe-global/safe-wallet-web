import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import Track from '@/components/common/Track'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { CREATE_SAFE_EVENTS } from '@/services/analytics'
import { Box, Button, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'

const WalletLogin = ({ onLogin }: { onLogin: () => void }) => {
  const wallet = useWallet()
  const connectWallet = useConnectWallet()

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (wallet !== null && !isSocialLogin) {
    return (
      <Box sx={{ width: '100%' }}>
        <Track {...CREATE_SAFE_EVENTS.CONTINUE_TO_CREATION}>
          <Button variant="contained" sx={{ padding: '8px 16px' }} fullWidth onClick={onLogin}>
            <Box
              width="100%"
              justifyContent="space-between"
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={1}
            >
              <Box display="flex" flexDirection="column" alignItems="flex-start">
                <Typography variant="subtitle2" fontWeight={700}>
                  Continue with {wallet.label}
                </Typography>
                {wallet.address && (
                  <EthHashInfo
                    address={wallet.address}
                    shortAddress
                    avatarSize={16}
                    showName={false}
                    copyAddress={false}
                  />
                )}
              </Box>
              {wallet.icon && (
                <img
                  width="24px"
                  height="24px"
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(wallet.icon)}`}
                  alt="icon"
                />
              )}
            </Box>
          </Button>
        </Track>
      </Box>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      sx={{ minHeight: '42px' }}
      variant="contained"
      size="small"
      disableElevation
      fullWidth
    >
      Connect wallet
    </Button>
  )
}

export default WalletLogin
