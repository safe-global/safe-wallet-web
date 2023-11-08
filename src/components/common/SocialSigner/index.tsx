import { Box, Button, SvgIcon, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
import { PasswordRecovery } from '@/components/common/SocialSigner/PasswordRecovery'
import GoogleLogo from '@/public/images/welcome/logo-google.svg'
import InfoIcon from '@/public/images/notifications/info.svg'

import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import useChains, { useCurrentChain } from '@/hooks/useChains'
import { isSocialWalletEnabled } from '@/hooks/wallets/wallets'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { CGW_NAMES } from '@/hooks/wallets/consts'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { TxModalContext } from '@/components/tx-flow'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import madProps from '@/utils/mad-props'
import { asError } from '@/services/exceptions/utils'
import ErrorMessage from '@/components/tx/ErrorMessage'

export const _getSupportedChains = (chains: ChainInfo[]) => {
  return chains
    .filter((chain) => CGW_NAMES.SOCIAL_LOGIN && !chain.disabledWallets.includes(CGW_NAMES.SOCIAL_LOGIN))
    .map((chainConfig) => chainConfig.chainName)
}
const useGetSupportedChains = () => {
  const chains = useChains()

  return useMemo(() => {
    return _getSupportedChains(chains.configs)
  }, [chains.configs])
}

const useIsSocialWalletEnabled = () => {
  const currentChain = useCurrentChain()

  return isSocialWalletEnabled(currentChain)
}

type SocialSignerLoginProps = {
  socialWalletService: ReturnType<typeof useSocialWallet>
  wallet: ReturnType<typeof useWallet>
  supportedChains: ReturnType<typeof useGetSupportedChains>
  isMPCLoginEnabled: ReturnType<typeof useIsSocialWalletEnabled>
  onLogin?: () => void
  onRequirePassword?: () => void
}

export const SocialSigner = ({
  socialWalletService,
  wallet,
  supportedChains,
  isMPCLoginEnabled,
  onLogin,
  onRequirePassword,
}: SocialSignerLoginProps) => {
  const [loginPending, setLoginPending] = useState<boolean>(false)
  const [loginError, setLoginError] = useState<string | undefined>(undefined)
  const { setTxFlow } = useContext(TxModalContext)
  const userInfo = socialWalletService?.getUserInfo()
  const isDisabled = loginPending || !isMPCLoginEnabled

  const isWelcomePage = onLogin !== undefined

  const recoverPassword = useCallback(
    async (password: string, storeDeviceFactor: boolean) => {
      if (!socialWalletService) return

      const success = await socialWalletService.recoverAccountWithPassword(password, storeDeviceFactor)

      if (success) {
        onLogin?.()
        setTxFlow(undefined)
      }
    },
    [onLogin, setTxFlow, socialWalletService],
  )

  const login = async () => {
    if (!socialWalletService) return

    setLoginPending(true)
    setLoginError(undefined)
    try {
      const status = await socialWalletService.loginAndCreate()

      if (status === COREKIT_STATUS.LOGGED_IN) {
        onLogin?.()
        setLoginPending(false)
        return
      }

      if (status === COREKIT_STATUS.REQUIRED_SHARE) {
        onRequirePassword?.()

        setTxFlow(
          <PasswordRecovery recoverFactorWithPassword={recoverPassword} onSuccess={onLogin} />,
          () => setLoginPending(false),
          false,
        )
        return
      }
    } catch (err) {
      const error = asError(err)
      setLoginError(error.message)
    } finally {
      setLoginPending(false)
    }
  }

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2} sx={{ width: '100%' }}>
        {isSocialLogin && userInfo ? (
          <Track {...CREATE_SAFE_EVENTS.CONTINUE_TO_CREATION}>
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
          </Track>
        ) : (
          <Track {...MPC_WALLET_EVENTS.CONNECT_GOOGLE} label={isWelcomePage ? 'welcome' : 'navBar'}>
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
          </Track>
        )}
        {loginError && <ErrorMessage className={css.loginError}>{loginError}</ErrorMessage>}
      </Box>

      {!isMPCLoginEnabled && (
        <Typography variant="body2" color="text.secondary" display="flex" gap={1}>
          <Tooltip title="More network support coming soon." arrow placement="top">
            <span>
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
            </span>
          </Tooltip>
          <span>Currently only supported on {supportedChains.join(supportedChains.length === 2 ? ' and ' : ', ')}</span>
        </Typography>
      )}
    </>
  )
}

export default madProps(SocialSigner, {
  socialWalletService: useSocialWallet,
  wallet: useWallet,
  supportedChains: useGetSupportedChains,
  isMPCLoginEnabled: useIsSocialWalletEnabled,
})
