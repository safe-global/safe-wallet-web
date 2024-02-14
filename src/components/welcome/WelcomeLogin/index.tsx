import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { Paper, SvgIcon, Typography, Divider, Box, Skeleton } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import dynamic from 'next/dynamic'
import css from './styles.module.css'
import { useRouter } from 'next/router'
import WalletLogin from './WalletLogin'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import { trackEvent } from '@/services/analytics'
import useWallet from '@/hooks/wallets/useWallet'
import { useHasSafes } from '../MyAccounts/useAllSafes'

const SocialSigner = dynamic(() => import('@/components/common/SocialSigner'), {
  loading: () => <Skeleton variant="rounded" height={42} width="100%" />,
})

const WelcomeLogin = () => {
  const router = useRouter()
  const wallet = useWallet()
  const isSocialLoginEnabled = useHasFeature(FEATURES.SOCIAL_LOGIN)
  const hasSafes = useHasSafes()

  const continueToCreation = () => {
    if (hasSafes) {
      router.push({ pathname: AppRoutes.welcome.accounts, query: router.query })
    } else {
      trackEvent(CREATE_SAFE_EVENTS.OPEN_SAFE_CREATION)
      router.push({ pathname: AppRoutes.newSafe.create, query: router.query })
    }
  }

  return (
    <Paper className={css.loginCard} data-testid="welcome-login">
      <Box className={css.loginContent}>
        <SvgIcon component={SafeLogo} inheritViewBox sx={{ height: '24px', width: '80px', ml: '-8px' }} />

        <Typography variant="h6" mt={6} fontWeight={700}>
          Get started
        </Typography>

        <Typography mb={2} textAlign="center">
          {wallet
            ? 'Open your existing Safe Accounts or create a new one'
            : 'Connect your wallet to create a new Safe Account or open an existing one'}
        </Typography>

        <WalletLogin onLogin={continueToCreation} />

        {isSocialLoginEnabled && (
          <>
            <Divider sx={{ mt: 2, mb: 2, width: '100%' }}>
              <Typography color="text.secondary" fontWeight={700} variant="overline">
                or
              </Typography>
            </Divider>

            <SocialSigner onLogin={continueToCreation} />
          </>
        )}
      </Box>
    </Paper>
  )
}

export default WelcomeLogin
