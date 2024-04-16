import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import { type ISocialWalletService } from '@/services/mpc/interfaces'
import { Alert, Box, Button, LinearProgress, SvgIcon, Typography } from '@mui/material'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { useState } from 'react'
import GoogleLogo from '@/public/images/welcome/logo-google.svg'

import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { CGW_NAMES } from '@/hooks/wallets/consts'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import madProps from '@/utils/mad-props'
import { asError } from '@/services/exceptions/utils'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { open } from '@/services/mpc/PasswordRecoveryModal'

export const _getSupportedChains = (chains: ChainInfo[]) => {
  return chains
    .filter((chain) => CGW_NAMES.SOCIAL_LOGIN && !chain.disabledWallets.includes(CGW_NAMES.SOCIAL_LOGIN))
    .map((chainConfig) => chainConfig.chainName)
}

type SocialSignerLoginProps = {
  socialWalletService: ISocialWalletService | undefined
  wallet: ReturnType<typeof useWallet>
  onLogin?: () => void
  onRequirePassword?: () => void
}

export const SocialSigner = ({ socialWalletService, wallet, onLogin, onRequirePassword }: SocialSignerLoginProps) => {
  const [loginPending, setLoginPending] = useState<boolean>(false)
  const [loginError, setLoginError] = useState<string | undefined>(undefined)
  const userInfo = socialWalletService?.getUserInfo()
  const isDisabled = loginPending

  const isWelcomePage = !!onLogin

  const login = async () => {
    if (!socialWalletService) return

    setLoginPending(true)
    setLoginError(undefined)
    try {
      const status = await socialWalletService.loginAndCreate()

      if (status === COREKIT_STATUS.LOGGED_IN) {
        setLoginPending(false)
        return
      }

      if (status === COREKIT_STATUS.REQUIRED_SHARE) {
        onRequirePassword?.()
        open(() => setLoginPending(false))
        return
      }
    } catch (err) {
      const error = asError(err)
      setLoginError(error.message)
    } finally {
      setLoginPending(false)
      onLogin?.()
    }
  }

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2} sx={{ width: '100%' }}>
        {isSocialLogin && userInfo ? (
          <Track {...CREATE_SAFE_EVENTS.CONTINUE_TO_CREATION}>
            <Button
              data-testid="signed-in-account-btn"
              variant="outlined"
              sx={{ px: 2, py: 1, borderWidth: '1px !important' }}
              onClick={onLogin}
              size="small"
              disabled={isDisabled}
              fullWidth
            >
              <LinearProgress
                color="secondary"
                className={css.loginProgress}
                sx={{
                  opacity: loginPending ? 1 : 0,
                }}
              />
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
        ) : (
          <Track {...MPC_WALLET_EVENTS.CONNECT_GOOGLE} label={isWelcomePage ? 'welcomePage' : 'navBar'}>
            <Button
              data-testid="google-connect-btn"
              variant="outlined"
              onClick={login}
              size="small"
              disabled={isDisabled}
              fullWidth
              sx={{ borderWidth: '1px !important' }}
            >
              <LinearProgress
                color="secondary"
                className={css.loginProgress}
                sx={{
                  opacity: loginPending ? 1 : 0,
                }}
              />
              <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                <SvgIcon component={GoogleLogo} inheritViewBox fontSize="medium" /> Continue with Google
              </Box>
            </Button>
          </Track>
        )}
        {loginError && <ErrorMessage className={css.loginError}>{loginError}</ErrorMessage>}
      </Box>

      <Alert severity="warning" sx={{ mt: 1, width: '100%' }}>
        From <b>01.05.2024</b> we will no longer support account creation and login with Google.
      </Alert>
    </>
  )
}

export default madProps(SocialSigner, {
  socialWalletService: useSocialWallet,
  wallet: useWallet,
})
