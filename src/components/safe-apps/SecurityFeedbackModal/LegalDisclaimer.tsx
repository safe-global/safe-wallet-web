import { Link, Typography } from '@mui/material'

import css from './styles.module.css'

const LegalDisclaimer = (): JSX.Element => (
  <div className={css.disclaimerContainer}>
    <Typography
      variant="body2"
      sx={{
        textAlign: 'center',
        color: '#b2bbc0',
        margin: '0 75px',
      }}
    >
      Before starting to use Safe dApps...
    </Typography>
    <Typography
      variant="h3"
      sx={{
        textAlign: 'center',
        margin: '24px 0',
        color: 'inherit',
        fontWeight: 'bold',
      }}
    >
      Disclaimer
    </Typography>
    <div className={css.disclaimerInner}>
      <Typography>
        You are now accessing third-party apps, which we do not own, control, maintain or audit. We are not liable for
        any loss you may suffer in connection with interacting with the apps, which is at your own risk.
      </Typography>
      <br />
      <br />
      <Typography>
        You must read our Terms, which contain more detailed provisions binding on you relating to the apps.
      </Typography>
      <br />
      <br />
      <Typography>
        I have read and understood the{' '}
        <Link
          href="https://gnosis-safe.io/terms"
          rel="noopener noreferrer"
          target="_blank"
          sx={{ textDecoration: 'none' }}
        >
          Terms
        </Link>{' '}
        and this Disclaimer, and agree to be bound by them.
      </Typography>
    </div>
  </div>
)

export default LegalDisclaimer
