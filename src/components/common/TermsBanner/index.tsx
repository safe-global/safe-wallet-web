import { useEffect } from 'react'
import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import MUILink from '@mui/material/Link'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { type CookiesState, CookieType } from '@/store/cookiesSlice'
import local from '@/services/local-storage/local'

const TERMS_KEY = 'show_terms'

const TermsBanner = () => {
  const [showTerms = true, setShowTerms] = useLocalStorage<boolean>(TERMS_KEY)

  useEffect(() => {
    const existingUser = local.getItem<CookiesState>('cookies')?.[CookieType.NECESSARY] !== undefined

    if (!existingUser) {
      setShowTerms(false)
    }
  }, [setShowTerms])

  const dismissBanner = () => {
    setShowTerms(false)
  }

  return showTerms ? (
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
