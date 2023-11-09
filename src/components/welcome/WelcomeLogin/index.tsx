import SocialSigner from '@/components/common/SocialSigner'
import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { Paper, SvgIcon, Typography, Divider, Link, Box } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import css from './styles.module.css'
import { useRouter } from 'next/router'
import WalletLogin from './WalletLogin'
import { LOAD_SAFE_EVENTS, CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import Track from '@/components/common/Track'
import { trackEvent } from '@/services/analytics'
import { getOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import { checksumAddress } from '@/utils/addresses'

const WelcomeLogin = ({ setOpenSafeList }: { setOpenSafeList: (open: boolean) => void }) => {
  const router = useRouter()
  const isSocialLoginEnabled = useHasFeature(FEATURES.SOCIAL_LOGIN)
  const currentChainId = useChainId()

  const continueToCreation = async (address: string) => {
    const ownedSafes = await getOwnedSafes(currentChainId, checksumAddress(address))
    if (ownedSafes.safes.length > 0) {
      setOpenSafeList(true)
      return
    }
    trackEvent(CREATE_SAFE_EVENTS.OPEN_SAFE_CREATION)
    router.push({ pathname: AppRoutes.newSafe.create, query: router.query })
  }

  return (
    <Paper className={css.loginCard} data-testid="welcome-login">
      <Box className={css.loginContent}>
        <SvgIcon component={SafeLogo} inheritViewBox sx={{ height: '24px', width: '80px' }} />
        <Typography variant="h6" mt={6} fontWeight={700}>
          Create Account
        </Typography>
        <Typography mb={2} textAlign="center">
          Choose how you would like to create your Safe Account
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
