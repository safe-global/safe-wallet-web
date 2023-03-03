import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import MUILink from '@mui/material/Link'
import useLocalStorage from '@/services/local-storage/useLocalStorage'

const TERMS_KEY = 'terms_dismissed'

const TermsBanner = () => {
  const [isDismissed = false, setIsDismissed] = useLocalStorage<boolean>(TERMS_KEY)

  const dismissBanner = () => {
    setIsDismissed(true)
  }

  if (isDismissed) return null

  return (
    <div className={css.wrapper}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Terms
      </Typography>
      <Typography>
        We updated our Terms and Conditions. Review the new terms{' '}
        <Link href={AppRoutes.terms} passHref>
          <MUILink color="success.main"> here</MUILink>
        </Link>
      </Typography>
      <Button
        variant="contained"
        color="success"
        size="small"
        className={css.button}
        onClick={dismissBanner}
        disableElevation
      >
        Ok
      </Button>
    </div>
  )
}

export default TermsBanner
