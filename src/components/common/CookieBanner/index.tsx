import { useEffect, type ReactElement } from 'react'
import { Grid, Button, Checkbox, FormControlLabel, Typography, Paper, SvgIcon } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { useForm } from 'react-hook-form'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectCookies, CookieType, saveCookieConsent } from '@/store/cookiesSlice'
import { selectCookieBanner, openCookieBanner, closeCookieBanner } from '@/store/popupSlice'

import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import ExternalLink from '../ExternalLink'

const COOKIE_WARNING: Record<CookieType, string> = {
  [CookieType.UPDATES]: `You attempted to open the "What's new" section but need to accept the "Beamer" cookies first.`,
  [CookieType.ANALYTICS]: '',
}

const CookieBannerPopup = ({ warningKey }: { warningKey?: CookieType }): ReactElement => {
  const warning = warningKey ? COOKIE_WARNING[warningKey] : undefined
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)

  const { register, watch, getValues, setValue } = useForm({
    defaultValues: {
      [CookieType.UPDATES]: cookies[CookieType.UPDATES] ?? false,
      [CookieType.ANALYTICS]: cookies[CookieType.ANALYTICS] ?? false,
      ...(warningKey ? { [warningKey]: true } : {}),
    },
  })

  const handleAccept = () => {
    dispatch(saveCookieConsent(getValues()))
    dispatch(closeCookieBanner())
  }

  const handleAcceptAll = () => {
    setValue(CookieType.UPDATES, true)
    setValue(CookieType.ANALYTICS, true)
    setTimeout(handleAccept, 100)
  }

  return (
    <Paper className={css.container} elevation={3}>
      {warning && (
        <Typography align="center" paddingBottom="8px">
          <SvgIcon component={WarningIcon} inheritViewBox fontSize="small" color="error" /> {warning}
        </Typography>
      )}

      <form>
        <Grid container alignItems="center" spacing={4}>
          <Grid item md={3} />

          <Grid item xs>
            <Typography align="center" mb={5}>
              By clicking &quot;Accept all&quot; you agree to the use of the tools listed below and their corresponding{' '}
              <span style={{ whiteSpace: 'nowrap' }}>3rd-party</span> cookies.{' '}
              <ExternalLink href={AppRoutes.cookie}>Cookie policy</ExternalLink>
            </Typography>

            <Grid container alignItems="center" gap={4}>
              <Grid item xs={12} sm>
                <Grid container justifyItems="flex-start" gap={1} pb={2}>
                  <Grid item width={200}>
                    <FormControlLabel
                      control={<Checkbox {...register(CookieType.UPDATES)} id="beamer" />}
                      label="Beamer"
                      checked={watch(CookieType.UPDATES)}
                      sx={{ mt: '-9px' }}
                    />
                  </Grid>

                  <Grid item sm xs={12}>
                    <label htmlFor="beamer">New features and product announcements</label>
                  </Grid>
                </Grid>

                <Grid container justifyItems="flex-start" gap={1}>
                  <Grid item width={200}>
                    <FormControlLabel
                      control={<Checkbox {...register(CookieType.ANALYTICS)} id="ga" />}
                      label="Google Analytics"
                      checked={watch(CookieType.ANALYTICS)}
                      sx={{ mt: '-9px' }}
                    />
                  </Grid>

                  <Grid item sm xs={12}>
                    <label htmlFor="ga">
                      Help us make the app better. We never track your Safe or wallet addresses, or any transaction
                      data.
                    </label>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid container alignItems="center" justifyContent="center" mt={4} gap={2}>
              <Grid item>
                <Button onClick={handleAccept} variant="text" disableElevation>
                  Accept selection
                </Button>
              </Grid>

              <Grid item>
                <Button onClick={handleAcceptAll} variant="contained" disableElevation sx={{ width: 200 }}>
                  Accept all
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item md={3} />
        </Grid>
      </form>
    </Paper>
  )
}

const CookieBanner = (): ReactElement | null => {
  const cookiePopup = useAppSelector(selectCookieBanner)
  const cookies = useAppSelector(selectCookies)
  const dispatch = useAppDispatch()

  // Open the banner if cookie preferences haven't been set
  const shouldOpen = cookies[CookieType.ANALYTICS] === undefined || cookies[CookieType.UPDATES] === undefined

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
