import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { Button, Typography } from '@mui/material'
import Link from 'next/link'
import MUILink from '@mui/material/Link'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useEffect, useState } from 'react'

const TERMS_KEY = 'terms_dismissed'

const TermsBanner = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [isDismissed = false, setIsDismissed] = useLocalStorage<boolean>(TERMS_KEY)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const dismissBanner = () => {
    setIsDismissed(true)
  }

  if (!isMounted) return <></>

  return !isDismissed ? (
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
