import MPCLogin from '@/components/common/ConnectWallet/MPCLogin'
import { AppRoutes } from '@/config/routes'
import { Paper, SvgIcon, Typography, Divider, Link, Box } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import css from './styles.module.css'
import { useRouter } from 'next/router'
import WalletLogin from './WalletLogin'
import { LOAD_SAFE_EVENTS, CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import Track from '@/components/common/Track'
import { trackEvent } from '@/services/analytics'

const WelcomeLogin = () => {
  const router = useRouter()

  const continueToCreation = () => {
    trackEvent(CREATE_SAFE_EVENTS.OPEN_SAFE_CREATION)
    router.push(AppRoutes.newSafe.create)
  }

  return (
    <Paper className={css.loginCard}>
      <Box className={css.loginContent}>
        <SvgIcon component={SafeLogo} inheritViewBox sx={{ height: '24px', width: '80px' }} />
        <Typography variant="h6" mt={6} fontWeight={700}>
          Create Account
        </Typography>
        <Typography mb={2} textAlign="center">
          Choose how you would like to create your Safe Account
        </Typography>
        <WalletLogin onLogin={continueToCreation} />

        <Divider sx={{ mt: 2, mb: 2, width: '100%' }}>
          <Typography color="text.secondary" fontWeight={700} variant="overline">
            or
          </Typography>
        </Divider>

        <MPCLogin onLogin={continueToCreation} />

        <Typography mt={2} textAlign="center">
          Already have a Safe Account?
        </Typography>
        <Track {...LOAD_SAFE_EVENTS.LOAD_BUTTON}>
          <Link color="primary" href={AppRoutes.newSafe.load}>
            Add existing one
          </Link>
        </Track>
      </Box>
    </Paper>
  )
}

export default WelcomeLogin
