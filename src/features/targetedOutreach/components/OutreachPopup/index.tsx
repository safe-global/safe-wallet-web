import { useCallback, useEffect, type ReactElement } from 'react'
import classnames from 'classnames'
import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'

import { useAppDispatch, useAppSelector } from '@/store'

import css from './styles.module.css'
import { closeOutreachBanner, openOutreachBanner, selectOutreachBanner } from '@/store/popupSlice'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useShowOutreachPopup } from '../../hooks/useShowOutreachPopup'

const OUTREACH_POPUP = 'outreachPopup_v1'

export type OutreachPopupState = {
  isClosed?: boolean
  askAgainLater?: boolean
  activityTimestamps?: number[]
}

const OutreachPopup = (): ReactElement | null => {
  const dispatch = useAppDispatch()
  const outreachPopup = useAppSelector(selectOutreachBanner)
  const [outreachPopupState, setOutreachPopupState] = useLocalStorage<OutreachPopupState>(OUTREACH_POPUP)
  const shouldOpen = useShowOutreachPopup(outreachPopupState)

  const handleClose = () => {
    setOutreachPopupState({ isClosed: true, askAgainLater: false })
    dispatch(closeOutreachBanner())
  }

  const handleAskAgainLater = () => {
    setOutreachPopupState({ askAgainLater: true, activityTimestamps: [Date.now()] })
    dispatch(closeOutreachBanner())
  }

  const getUpdatedUserActivity = useCallback(() => {
    const currentTime = new Date().getTime()
    const activityTimestamps = outreachPopupState?.activityTimestamps

    if (!activityTimestamps) {
      return [currentTime]
    }

    const lastTimestamp = activityTimestamps[activityTimestamps.length - 1]
    const timeSinceLastVisit = currentTime - lastTimestamp
    // 1 hour
    // if (timeSinceLastVisit < 60 * 60 * 1000) {
    //   return activityTimestamps
    // }
    // 1 sec
    if (timeSinceLastVisit < 1000) {
      return activityTimestamps
    }

    return [...activityTimestamps, currentTime]
  }, [outreachPopupState?.activityTimestamps])

  const handleAccept = () => {}

  // const shouldOpen = isTargetedSafe && isSigner && !outreachPopupState?.isClosed

  useEffect(() => {
    if (outreachPopupState?.askAgainLater && !shouldOpen) {
      console.log('------------------------>')
      const updatedUserActivity = getUpdatedUserActivity()
      setOutreachPopupState({
        askAgainLater: true,
        activityTimestamps: updatedUserActivity,
      })
    }
  }, [getUpdatedUserActivity, outreachPopupState?.askAgainLater, setOutreachPopupState, shouldOpen])

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
          <Typography variant="h4" fontWeight={700}>
            You&apos;re invited!
          </Typography>
          <Typography>
            As one of our top users, we&apos;d love to hear your feedback on how we can enhance Safe. Share your contact
            info, and we&apos;ll reach out for a short interview.
          </Typography>
          <Button fullWidth variant="contained" onClick={handleAccept}>
            Get Involved
          </Button>
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
