import { useEffect, type ReactElement } from 'react'
import classnames from 'classnames'
import { Avatar, Box, Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '@/store'

import css from './styles.module.css'
import { closeOutreachBanner, openOutreachBanner, selectOutreachBanner } from '@/store/popupSlice'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useShowOutreachPopup } from '../../hooks/useShowOutreachPopup'
import { getUpdatedUserActivity } from '../../utils/getUpdatedUserActivity'
import Link from 'next/link'
import { ACTIVE_OUTREACH, OUTREACH_LS_KEY } from '../../constants'

export type OutreachPopupState = {
  isClosed?: boolean
  askAgainLater?: boolean
  activityTimestamps?: number[]
}

const OutreachPopup = (): ReactElement | null => {
  const dispatch = useAppDispatch()
  const outreachPopup = useAppSelector(selectOutreachBanner)
  const [outreachPopupState, setOutreachPopupState] = useLocalStorage<OutreachPopupState>(OUTREACH_LS_KEY)
  const shouldOpen = useShowOutreachPopup(outreachPopupState)

  const handleClose = () => {
    setOutreachPopupState({ isClosed: true, askAgainLater: false })
    dispatch(closeOutreachBanner())
  }

  const handleAskAgainLater = () => {
    setOutreachPopupState({ askAgainLater: true, activityTimestamps: [Date.now()] })
    dispatch(closeOutreachBanner())
  }

  // Log activity in LS to flag frequent users.
  useEffect(() => {
    if (outreachPopupState?.askAgainLater && !shouldOpen) {
      const updatedUserActivity = getUpdatedUserActivity(outreachPopupState?.activityTimestamps)
      setOutreachPopupState({
        askAgainLater: true,
        activityTimestamps: updatedUserActivity,
      })
    }
  }, [outreachPopupState?.activityTimestamps, outreachPopupState?.askAgainLater, setOutreachPopupState, shouldOpen])

  // Decide whether to show the popup.
  useEffect(() => {
    if (shouldOpen) {
      dispatch(openOutreachBanner())
    } else {
      dispatch(closeOutreachBanner())
    }
  }, [dispatch, shouldOpen])

  if (!outreachPopup.open) return null

  return (
    <Box className={css.popup}>
      <Paper className={classnames(css.container, { [css.inverted]: false })}>
        <Stack gap={2}>
          <Box display="flex">
            <Avatar alt="Clem Bihorel" src="/images/common/outreach-popup-avatar.png" />
            <Box ml={1}>
              <Typography variant="body2">Clem Bihorel</Typography>
              <Typography variant="body2" color="primary.light">
                Product Lead
              </Typography>
            </Box>
          </Box>

          <Box>
            <Chip
              size="small"
              sx={{ backgroundColor: 'text.primary', color: 'background.paper', mt: '-2px' }}
              label={
                <Typography fontWeight={700} variant="overline">
                  EARN REWARDS
                </Typography>
              }
            />
          </Box>
          <Typography variant="h4" fontWeight={700}>
            You&apos;re invited!
          </Typography>
          <Typography>
            As one of our top users, we&apos;d love to hear your feedback on how we can enhance Safe. Share your contact
            info, and we&apos;ll reach out for a short interview.
          </Typography>
          <Link rel="noreferrer noopener" target="_blank" href={ACTIVE_OUTREACH.url}>
            <Button fullWidth variant="contained">
              Get Involved
            </Button>
          </Link>
          <Button fullWidth variant="text" onClick={handleAskAgainLater}>
            Ask me later
          </Button>
          <Typography variant="body2" color="primary.light" mx="auto">
            It&apos;ll only take 2 minutes.
          </Typography>

          <IconButton className={css.close} aria-label="close" onClick={handleClose}>
            <Close />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  )
}
export default OutreachPopup
