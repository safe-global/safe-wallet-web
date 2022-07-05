import { useState, useEffect, ChangeEvent, ReactElement } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Link, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectCookies, CookieType, saveCookieConsent } from '@/store/cookiesSlice'
import { selectCookieBanner, openCookieBanner, closeCookieBanner } from '@/store/popupSlice'

import css from './styles.module.css'

const COOKIE_WARNING: Record<CookieType, string> = {
  [CookieType.NECESSARY_COOKIE]: '',
  [CookieType.UPDATES_COOKIE]: `You attempted to open the "What's New" section but need to accept the "Updates & Feedback" cookies first.`,
  [CookieType.ANALYTICS_COOKIE]: '',
}

const CookieBannerPopup = ({ warning }: { warning?: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)
  const [consent, setConsent] = useState(cookies)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setConsent((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAccept = () => {
    dispatch(
      saveCookieConsent({
        consent: {
          ...consent,
          [CookieType.NECESSARY_COOKIE]: true,
        },
      }),
    )
    dispatch(closeCookieBanner())
  }

  const handleAcceptAll = () => {
    setConsent({
      [CookieType.NECESSARY_COOKIE]: true,
      [CookieType.UPDATES_COOKIE]: true,
      [CookieType.ANALYTICS_COOKIE]: true,
    })
    handleAccept()
  }

  return (
    <Box
      sx={({ palette }) => ({
        backgroundColor: 'background.paper',
        borderTop: `1px solid ${palette.gray[500]}`,
        // Rendering `null` causes hydration error
      })}
      className={css.container}
    >
      {warning && (
        <Typography align="center" paddingBottom="8px">
          <WarningAmberIcon fontSize="small" sx={({ palette }) => ({ fill: palette.error.main })} /> {warning}
        </Typography>
      )}

      <Typography align="center">
        We use cookies to provide you with the best experience and to help improve our website and application. Please
        read our{' '}
        <Link href="https://gnosis-safe.io/cookie" target="_blank" rel="noopener noreferrer">
          Cookie Policy
        </Link>{' '}
        for more information. By clicking &quot;Accept all&quot;, you agree to the storing of cookies on your device to
        enhance site navigation, analyze site usage and provide customer support.
      </Typography>

      <form className={css.form}>
        <FormControlLabel
          control={<Checkbox defaultChecked name={CookieType.NECESSARY_COOKIE} disabled />}
          label="Necessary"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={consent[CookieType.UPDATES_COOKIE]}
              name={CookieType.UPDATES_COOKIE}
              onChange={handleChange}
            />
          }
          label="Updates & Feedback"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={consent[CookieType.ANALYTICS_COOKIE]}
              name={CookieType.ANALYTICS_COOKIE}
              onChange={handleChange}
            />
          }
          label="Analytics"
        />

        <Button onClick={handleAccept} variant="outlined" disableElevation>
          Accept selection
        </Button>
        <Button onClick={handleAcceptAll} variant="contained" disableElevation>
          Accept all
        </Button>
      </form>
    </Box>
  )
}

const CookieBanner = (): ReactElement | null => {
  const cookiePopup = useAppSelector(selectCookieBanner)
  const cookies = useAppSelector(selectCookies)
  const dispatch = useAppDispatch()

  // Open the banner if "necessary" cookies haven't been accepted
  const shouldOpen = !cookies[CookieType.NECESSARY_COOKIE]
  useEffect(() => {
    if (shouldOpen) {
      dispatch(openCookieBanner({}))
    }
  }, [dispatch, shouldOpen])

  const warning = cookiePopup.warningKey && COOKIE_WARNING[cookiePopup.warningKey]

  return cookiePopup?.open ? <CookieBannerPopup warning={warning} /> : null
}

export default CookieBanner
