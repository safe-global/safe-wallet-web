import { MPCWalletState } from '@/hooks/wallets/mpc/useMPCWallet'
import { Box, Button, SvgIcon, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { MpcWalletContext } from './MPCWalletProvider'
import { PasswordRecovery } from './PasswordRecovery'
import GoogleLogo from '@/public/images/welcome/logo-google.svg'

import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'

const MPCLogin = ({ onLogin }: { onLogin?: () => void }) => {
  const { loginPending, triggerLogin, userInfo, walletState, recoverFactorWithPassword } = useContext(MpcWalletContext)

  const wallet = useWallet()

  const [loginTriggered, setLoginTriggered] = useState(false)

  const login = async () => {
    setLoginTriggered(true)
    await triggerLogin()
  }

  // If login was triggered through the Button we immediately continue if logged in
  useEffect(() => {
    if (loginTriggered && wallet && wallet.label === ONBOARD_MPC_MODULE_LABEL && onLogin) {
      onLogin()
    }
  }, [loginTriggered, onLogin, wallet])

  return (
    <>
      {wallet && userInfo.email ? (
        <>
          <Button
            variant="outlined"
            sx={{ padding: '8px 16px' }}
            onClick={onLogin}
            size="small"
            disabled={loginPending}
            fullWidth
          >
            <Box
              width="100%"
              justifyContent="space-between"
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={1}
            >
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
              <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" />
            </Box>
          </Button>
        </>
      ) : (
        <Button variant="outlined" onClick={login} size="small" disabled={loginPending} fullWidth>
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" /> Continue with Google
          </Box>
        </Button>
      )}

      {walletState === MPCWalletState.MANUAL_RECOVERY && (
        <PasswordRecovery recoverFactorWithPassword={recoverFactorWithPassword} />
      )}
    </>
  )
}

export default MPCLogin
