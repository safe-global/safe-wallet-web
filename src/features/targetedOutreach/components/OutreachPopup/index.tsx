import { useEffect, type ReactElement } from 'react'
import { Avatar, Box, Button, Chip, IconButton, Link, Paper, Stack, ThemeProvider, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import type { Theme } from '@mui/material/styles'
import { useAppDispatch, useAppSelector } from '@/store'
import css from './styles.module.css'
import { closeOutreachBanner, openOutreachBanner, selectOutreachBanner } from '@/store/popupSlice'
import useLocalStorage, { useSessionStorage } from '@/services/local-storage/useLocalStorage'
import useShowOutreachPopup from '@/features/targetedOutreach/hooks/useShowOutreachPopup'
import { ACTIVE_OUTREACH, OUTREACH_LS_KEY, OUTREACH_SS_KEY } from '@/features/targetedOutreach/constants'
import Track from '@/components/common/Track'
import { OUTREACH_EVENTS } from '@/services/analytics/events/outreach'
import SafeThemeProvider from '@/components/theme/SafeThemeProvider'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { createSubmission } from '@safe-global/safe-client-gateway-sdk'
import useSubmission from '@/features/targetedOutreach/hooks/useSubmission'

const OutreachPopup = (): ReactElement | null => {
  const dispatch = useAppDispatch()
  const outreachPopup = useAppSelector(selectOutreachBanner)
  const [isClosed, setIsClosed] = useLocalStorage<boolean>(OUTREACH_LS_KEY)
  const currentChainId = useChainId()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const submission = useSubmission()

  const [askAgainLaterTimestamp, setAskAgainLaterTimestamp] = useSessionStorage<number>(OUTREACH_SS_KEY)

  const shouldOpen = useShowOutreachPopup(isClosed, askAgainLaterTimestamp, submission)

  const handleClose = () => {
    setIsClosed(true)
    dispatch(closeOutreachBanner())
  }

  const handleAskAgainLater = () => {
    setAskAgainLaterTimestamp(Date.now())
    dispatch(closeOutreachBanner())
  }

  // Decide whether to show the popup.
  useEffect(() => {
    if (shouldOpen) {
      dispatch(openOutreachBanner())
    } else {
      dispatch(closeOutreachBanner())
    }
  }, [dispatch, shouldOpen])

  if (!outreachPopup.open) return null

  const handleOpenSurvey = async () => {
    if (wallet) {
      await createSubmission({
        params: {
          path: { outreachId: ACTIVE_OUTREACH.id, chainId: currentChainId, safeAddress, signerAddress: wallet.address },
        },
        body: { completed: true },
      })
    }
    dispatch(closeOutreachBanner())
  }

  return (
    // Enforce light theme for the popup
    <SafeThemeProvider mode="light">
      {(safeTheme: Theme) => (
        <ThemeProvider theme={safeTheme}>
          <Box className={css.popup}>
            <Paper className={css.container}>
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
                  As one of our top users, we&apos;d love to hear your feedback on how we can enhance Safe. Share your
                  contact info, and we&apos;ll reach out for a short interview.
                </Typography>
                <Track {...OUTREACH_EVENTS.OPEN_SURVEY}>
                  <Link rel="noreferrer noopener" target="_blank" href={ACTIVE_OUTREACH.url}>
                    <Button fullWidth variant="contained" onClick={handleOpenSurvey}>
                      Get Involved
                    </Button>
                  </Link>
                </Track>
                <Track {...OUTREACH_EVENTS.ASK_AGAIN_LATER}>
                  <Button fullWidth variant="text" onClick={handleAskAgainLater}>
                    Ask me later
                  </Button>
                </Track>
                <Typography variant="body2" color="primary.light" mx="auto">
                  It&apos;ll only take 2 minutes.
                </Typography>
                <Track {...OUTREACH_EVENTS.CLOSE_POPUP}>
                  <IconButton className={css.close} aria-label="close" onClick={handleClose}>
                    <Close />
                  </IconButton>
                </Track>
              </Stack>
            </Paper>
          </Box>
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  )
}
export default OutreachPopup
