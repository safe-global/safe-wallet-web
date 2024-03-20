import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { Paper, SvgIcon, Typography, Divider, Box, Skeleton, Button, Link } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import dynamic from 'next/dynamic'
import css from './styles.module.css'
import { useRouter } from 'next/router'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS, trackEvent } from '@/services/analytics'
import useWallet from '@/hooks/wallets/useWallet'
import { useHasSafes } from '../MyAccounts/useAllSafes'
import Track from '@/components/common/Track'
import { useCallback, useEffect, useState } from 'react'
import WalletLogin from './WalletLogin'

const SocialSigner = dynamic(() => import('@/components/common/SocialSigner'), {
  loading: () => <Skeleton variant="rounded" height={42} width="100%" />,
})

const WelcomeLogin = () => {
  const router = useRouter()
  const wallet = useWallet()
  const isSocialLoginEnabled = useHasFeature(FEATURES.SOCIAL_LOGIN)
  const { isLoaded, hasSafes } = useHasSafes()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  const onLogin = useCallback(() => {
    setShouldRedirect(true)
  }, [])

  useEffect(() => {
    if (!shouldRedirect) return

    if (wallet && isLoaded) {
      if (hasSafes) {
        router.push({ pathname: AppRoutes.welcome.accounts, query: router.query })
      } else {
        trackEvent(CREATE_SAFE_EVENTS.OPEN_SAFE_CREATION)
        router.push({ pathname: AppRoutes.newSafe.create, query: router.query })
      }
    }
  }, [hasSafes, isLoaded, router, wallet, shouldRedirect])

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

        <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={OVERVIEW_LABELS.welcome_page}>
          <WalletLogin onLogin={onLogin} />
        </Track>

        {isSocialLoginEnabled && (
          <>
            <Divider sx={{ mt: 2, mb: 2, width: '100%' }}>
              <Typography color="text.secondary" fontWeight={700} variant="overline">
                or
              </Typography>
            </Divider>

            <SocialSigner onLogin={onLogin} />
          </>
        )}

        {!wallet && (
          <>
            <Divider sx={{ mt: 2, mb: 2, width: '100%' }}>
              <Typography color="text.secondary" fontWeight={700} variant="overline">
                or
              </Typography>
            </Divider>
            {hasSafes ? (
              <Link href={AppRoutes.welcome.accounts}>
                <Button disableElevation size="small">
                  View my accounts
                </Button>
              </Link>
            ) : (
              <Link href={AppRoutes.newSafe.load}>
                <Button disableElevation size="small">
                  Watch any account
                </Button>
              </Link>
            )}
          </>
        )}
      </Box>
    </Paper>
  )
}

export default WelcomeLogin
