import EthHashInfo from '@/components/common/EthHashInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { Box, Button, Typography } from '@mui/material'
import { ConnectButton } from '@particle-network/connectkit'

const WalletLogin = ({ onLogin }: { onLogin: () => void }) => {
  const wallet = useWallet()

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (wallet !== null && !isSocialLogin) {
    return (
      <Box data-sid="79498" sx={{ width: '100%' }}>
        <Button data-sid="72529" variant="contained" sx={{ padding: '8px 16px' }} fullWidth onClick={onLogin}>
          <Box
            width="100%"
            justifyContent="space-between"
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={1}
          >
            <Box data-sid="44232" display="flex" flexDirection="column" alignItems="flex-start">
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
            {wallet.icon && <img width="24px" height="24px" src={wallet.icon} alt="icon" />}
          </Box>
        </Button>
      </Box>
    )
  }

  return (
    <div>
      <ConnectButton.Custom>
        {({ account, openConnectModal }) => {
          return (
            <div>
              {!account && (
                <Button
                  data-sid="89097"
                  onClick={openConnectModal}
                  sx={{ minHeight: '42px' }}
                  variant="contained"
                  size="small"
                  disableElevation
                  fullWidth
                >
                  Connect wallet
                </Button>
              )}
            </div>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}

export default WalletLogin
