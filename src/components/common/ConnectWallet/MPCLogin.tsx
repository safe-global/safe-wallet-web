import { MPCWalletState } from '@/hooks/wallets/mpc/useMPCWallet'
import { Box, Button, SvgIcon, Typography } from '@mui/material'
import { useContext } from 'react'
import { MpcWalletContext } from './MPCWalletProvider'
import { PasswordRecovery } from './PasswordRecovery'
import GoogleLogo from '@/public/images/welcome/logo-google.svg'

import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import Track from '../Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'

const MPCLogin = ({ onLogin }: { onLogin?: () => void }) => {
  const { triggerLogin, userInfo, walletState, recoverFactorWithPassword } = useContext(MpcWalletContext)

  const wallet = useWallet()
  const loginPending = walletState === MPCWalletState.AUTHENTICATING

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
          <Track {...CREATE_SAFE_EVENTS.CONTINUE_TO_CREATION} label={wallet.label}>
            <Button
              variant="outlined"
              sx={{ px: 2, py: 1, borderWidth: '1px !important' }}
              onClick={onLogin}
              size="small"
              disabled={loginPending}
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
          </Track>
        </>
      ) : (
        <Track {...MPC_WALLET_EVENTS.CONNECT_GOOGLE}>
          <Button
            variant="outlined"
            onClick={login}
            size="small"
            disabled={loginPending}
            fullWidth
            sx={{ borderWidth: '1px !important' }}
          >
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" /> Continue with Google
            </Box>
          </Button>
        </Track>
      )}

      {walletState === MPCWalletState.MANUAL_RECOVERY && (
        <PasswordRecovery recoverFactorWithPassword={recoverPassword} />
      )}
    </>
  )
}

export default MPCLogin
