import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import MUILink from '@mui/material/Link'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useMemo } from 'react'
import { type CookiesState, CookieType } from '@/store/cookiesSlice'
import local from '@/services/local-storage/local'

const TERMS_KEY = 'terms_dismissed'

const isExistingUser = () => {
  return local.getItem<CookiesState>('cookies')?.[CookieType.NECESSARY] || false
}

const TermsBanner = () => {
  const [isDismissed = false, setIsDismissed] = useLocalStorage<boolean>(TERMS_KEY)

  // Check on page load if "necessary" cookies have been accepted
  const existingUser = useMemo(() => isExistingUser(), [])
  const shouldOpen = existingUser && !isDismissed

  const dismissBanner = () => {
    setIsDismissed(true)
  }

  return shouldOpen ? (
    <div className={css.wrapper}>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        Terms
      </Typography>
      <Typography>
        We&apos;ve updated our Terms and Conditions. You can review them{' '}
        <Link href={AppRoutes.terms} passHref>
          <MUILink color="success.main">here</MUILink>
        </Link>
        .
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
  ) : null
}

export default TermsBanner
