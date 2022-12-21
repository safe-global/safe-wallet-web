import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { Button, Checkbox, FormControlLabel, Typography, Paper, SvgIcon } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectCookies, CookieType, saveCookieConsent } from '@/store/cookiesSlice'
import { selectCookieBanner, openCookieBanner, closeCookieBanner } from '@/store/popupSlice'

import css from './styles.module.css'
import ExternalLink from '../ExternalLink'

const COOKIE_WARNING: Record<CookieType, string> = {
  [CookieType.NECESSARY]: '',
  [CookieType.UPDATES]: `You attempted to open the "What's new" section but need to accept the "Updates & Feedback" cookies first.`,
  [CookieType.ANALYTICS]: '',
}

const CookieBannerPopup = ({ warningKey }: { warningKey?: CookieType }): ReactElement => {
  const warning = warningKey ? COOKIE_WARNING[warningKey] : undefined
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)

  const { register, watch, getValues, setValue } = useForm({
    defaultValues: {
      ...cookies,
      ...(warningKey ? { [warningKey]: true } : {}),
    },
  })

  const handleAccept = () => {
    setValue(CookieType.NECESSARY, true)
    dispatch(saveCookieConsent(getValues()))
    dispatch(closeCookieBanner())
  }

  const handleAcceptAll = () => {
    setValue(CookieType.UPDATES, true)
    setValue(CookieType.ANALYTICS, true)

    setTimeout(() => {
      handleAccept()
    }, 100)
  }

  return (
    <Paper className={css.container} elevation={3}>
      {warning && (
        <Typography align="center" paddingBottom="8px">
          <SvgIcon component={WarningIcon} inheritViewBox fontSize="small" color="error" /> {warning}
        </Typography>
      )}

      <Typography align="center">
        We use cookies to provide you with the best experience and to help improve our website and application. Please
        read our <ExternalLink href="https://safe.global/cookie">Cookie Policy</ExternalLink> for more information. By
        clicking &quot;Accept all&quot;, you agree to the storing of cookies on your device to enhance site navigation,
        analyze site usage and provide customer support.
      </Typography>

      <form className={css.grid}>
        <FormControlLabel
          control={<Checkbox defaultChecked disabled {...register(CookieType.NECESSARY)} />}
          label="Necessary"
        />

        <FormControlLabel
          control={<Checkbox {...register(CookieType.UPDATES)} />}
          label="Updates (Beamer)"
          checked={watch(CookieType.UPDATES)}
        />

        <FormControlLabel
          control={<Checkbox {...register(CookieType.ANALYTICS)} />}
          label="Analytics"
          checked={watch(CookieType.ANALYTICS)}
        />

        <div className={css.grid}>
          <Button onClick={handleAccept} variant="outlined" disableElevation>
            Accept selection
          </Button>
          <Button onClick={handleAcceptAll} variant="contained" disableElevation>
            Accept all
          </Button>
        </div>
      </form>
    </Paper>
  )
}

const CookieBanner = (): ReactElement | null => {
  const cookiePopup = useAppSelector(selectCookieBanner)
  const cookies = useAppSelector(selectCookies)
  const dispatch = useAppDispatch()

  // Open the banner if "necessary" cookies haven't been accepted
  const shouldOpen = !cookies[CookieType.NECESSARY]
  useEffect(() => {
    if (shouldOpen) {
      dispatch(openCookieBanner({}))
    } else {
      dispatch(closeCookieBanner())
    }
  }, [dispatch, shouldOpen])

  return cookiePopup?.open ? <CookieBannerPopup warningKey={cookiePopup.warningKey} /> : null
}

export default CookieBanner
