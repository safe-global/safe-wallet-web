import ExternalLink from '@/components/common/ExternalLink'
import { AppRoutes } from '@/config/routes'
import { Typography } from '@mui/material'

import css from './styles.module.css'

const LegalDisclaimer = (): JSX.Element => (
  <div className={css.disclaimerContainer}>
    <Typography variant="body2" color="text.secondary" mx={8}>
      Before starting to use Safe dApps...
    </Typography>
    <Typography variant="h3" fontWeight={700} my={3}>
      Disclaimer
    </Typography>
    <div className={css.disclaimerInner}>
      <Typography mb={4}>
        You are now accessing third-party apps, which we do not own, control, maintain or audit. We are not liable for
        any loss you may suffer in connection with interacting with the apps, which is at your own risk.
      </Typography>

      <Typography mb={4}>
        You must read our Terms, which contain more detailed provisions binding on you relating to the apps.
      </Typography>

      <Typography>
        I have read and understood the{' '}
        <ExternalLink href={AppRoutes.terms} sx={{ textDecoration: 'none' }}>
          Terms
        </ExternalLink>{' '}
        and this Disclaimer, and agree to be bound by them.
      </Typography>
    </div>
  </div>
)

export default LegalDisclaimer
