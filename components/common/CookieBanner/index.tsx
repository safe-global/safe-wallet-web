import { useState, ChangeEvent, ReactElement } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Link, Typography } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCookies,
  NECESSARY_COOKIE,
  SUPPORT_COOKIE,
  ANALYTICS_COOKIE,
  closeCookieBanner,
  saveCookieConsent,
  CookieConsent,
} from '@/store/cookiesSlice'

import css from './styles.module.css'

const COOKIE_WARNING: Record<keyof CookieConsent, string> = {
  [NECESSARY_COOKIE]: '',
  [SUPPORT_COOKIE]:
    'You attempted to open the "Need Help?" section but need to accept the "Community Support & Updates" cookies first.',
  [ANALYTICS_COOKIE]: '',
}

const CookieBanner = (): ReactElement => {
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)
  const [consent, setConsent] = useState(cookies.consent)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setConsent((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAccept = () => {
    dispatch(saveCookieConsent({ consent }))
    dispatch(closeCookieBanner())
  }

  const handleAcceptAll = () => {
    setConsent({
      [NECESSARY_COOKIE]: true,
      [SUPPORT_COOKIE]: true,
      [ANALYTICS_COOKIE]: true,
    })
    handleAccept()
  }

  return (
    <Box
      sx={({ palette }) => ({
        backgroundColor: 'background.paper',
        borderTop: `1px solid ${palette.gray[500]}`,
        // Rendering `null` causes hydration error
        display: !cookies.open ? 'none' : undefined,
      })}
      className={css.container}
    >
      {cookies.warningKey && COOKIE_WARNING[cookies.warningKey] && (
        <Typography align="center" paddingBottom="8px">
          <WarningAmberIcon fontSize="small" sx={({ palette }) => ({ fill: palette.error.main })} />{' '}
          {COOKIE_WARNING[cookies.warningKey]}
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
        <FormControlLabel control={<Checkbox defaultChecked name={NECESSARY_COOKIE} disabled />} label="Necessary" />
        <FormControlLabel
          control={<Checkbox checked={consent[SUPPORT_COOKIE]} name={SUPPORT_COOKIE} onChange={handleChange} />}
          label="Community Support & Updates"
        />
        <FormControlLabel
          control={<Checkbox checked={consent[ANALYTICS_COOKIE]} name={ANALYTICS_COOKIE} onChange={handleChange} />}
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

export default CookieBanner
