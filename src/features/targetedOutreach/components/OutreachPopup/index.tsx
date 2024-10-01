import { useEffect, type ReactElement } from 'react'
import classnames from 'classnames'
import { Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '@/store'
import { hasAcceptedTerms } from '@/store/cookiesAndTermsSlice'
import { openCookieBanner, closeCookieBanner } from '@/store/popupSlice'

import css from './styles.module.css'

const OutreachPopup = (): ReactElement | null => {
  const dispatch = useAppDispatch()

  const hasAccepted = useAppSelector(hasAcceptedTerms)
  const shouldOpen = !hasAccepted

  useEffect(() => {
    if (shouldOpen) {
      dispatch(openCookieBanner({}))
    } else {
      dispatch(closeCookieBanner())
    }
  }, [dispatch, shouldOpen])

  const bannerOpen = true

  if (!bannerOpen) return null

  return (
    <div className={css.popup}>
      <Paper className={classnames(css.container, { [css.inverted]: false })}>
        <Stack gap={2}>
          <Typography variant="h4" fontWeight={700}>
            You&apos;re invited!
          </Typography>
          <Typography>
            As one of our top users, we&apos;d love to hear your feedback on how we can enhance Safe. Share your contact
            info, and we&apos;ll reach out for a short interview.
          </Typography>
          <Button fullWidth variant="contained">
            Get Involved
          </Button>
          <Button fullWidth variant="text">
            Ask me later
          </Button>
          <Typography variant="body2" color="primary.light" mx="auto">
            It’ll only take 2 minutes.
          </Typography>

          <IconButton className={css.close} aria-label="close" onClick={() => {}} size="small">
            <Close fontSize="medium" />
          </IconButton>
        </Stack>
      </Paper>
    </div>
  )
}
export default OutreachPopup
