import { MPCWalletState } from '@/hooks/wallets/mpc/useMPCWallet'
import { Box, Button, SvgIcon, Typography } from '@mui/material'
import { useContext } from 'react'
import { MpcWalletContext } from './MPCWalletProvider'
import { PasswordRecovery } from './PasswordRecovery'
import GoogleLogo from '@/public/images/welcome/logo-google.svg'
import InfoIcon from '@/public/images/notifications/info.svg'

import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { useCurrentChain } from '@/hooks/useChains'
import chains from '@/config/chains'

const MPCLogin = ({ onLogin }: { onLogin?: () => void }) => {
  const currentChain = useCurrentChain()
  const { triggerLogin, userInfo, walletState, recoverFactorWithPassword } = useContext(MpcWalletContext)

  const wallet = useWallet()
  const loginPending = walletState === MPCWalletState.AUTHENTICATING

  // TODO: Replace with feature flag from config service
  const isMPCLoginEnabled = currentChain?.chainId === chains.gno
  const isDisabled = loginPending || !isMPCLoginEnabled

  const login = async () => {
    const success = await triggerLogin()

    if (success) {
      onLogin?.()
    }
  }

  const recoverPassword = async (password: string, storeDeviceFactor: boolean) => {
    const success = await recoverFactorWithPassword(password, storeDeviceFactor)

    if (success) {
      onLogin?.()
    }
  }

  return (
    <>
      {wallet && userInfo ? (
        <>
          <Button
            variant="outlined"
            sx={{ px: 2, py: 1, borderWidth: '1px !important' }}
            onClick={onLogin}
            size="small"
            disabled={isDisabled}
            fullWidth
          >
            <Box width="100%" display="flex" flexDirection="row" alignItems="center" gap={1}>
              <img
                src={userInfo.profileImage}
                className={css.profileImg}
                alt="Profile Image"
                referrerPolicy="no-referrer"
              />
              <div className={css.profileData}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Continue as {userInfo.name}
                </Typography>
                <Typography variant="body2">{userInfo.email}</Typography>
              </div>
              <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" sx={{ marginLeft: 'auto' }} />
            </Box>
          </Button>
        </>
      ) : (
        <Button
          variant="outlined"
          onClick={login}
          size="small"
          disabled={isDisabled}
          fullWidth
          sx={{ borderWidth: '1px !important' }}
        >
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" /> Continue with Google
          </Box>
        </Button>
      )}

      {!isMPCLoginEnabled && (
        <Typography variant="body2" color="text.secondary" display="flex" gap={1} alignItems="center">
          <SvgIcon
            component={InfoIcon}
            inheritViewBox
            color="border"
            fontSize="small"
            sx={{
              verticalAlign: 'middle',
              ml: 0.5,
            }}
          />
          Currently only supported on Gnosis Chain
        </Typography>
      )}

      {walletState === MPCWalletState.MANUAL_RECOVERY && (
        <PasswordRecovery recoverFactorWithPassword={recoverPassword} />
      )}
    </>
  )
}

export default MPCLogin
