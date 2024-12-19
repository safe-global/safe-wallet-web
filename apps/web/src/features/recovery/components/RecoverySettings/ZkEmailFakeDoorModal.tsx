import { type ReactElement } from 'react'
import { Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import RecoveryZkEmailIcon from '@/public/images/common/zkemail-logo.svg'
import css from './styles.module.css'

export function ZkEmailFakeDoorModal({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement {
  return (
    <Dialog open={open} onClose={onClose} className={css.dialog}>
      <DialogContent>
        <IconButton onClick={onClose} className={css.closeIcon}>
          <CloseIcon />
        </IconButton>

        <Stack spacing={4}>
          <RecoveryZkEmailIcon style={{ display: 'block' }} width={60} height={60} />

          <Stack spacing={2}>
            <Typography variant="h2">Feature is coming soon</Typography>

            <Typography variant="body1">
              Thanks for showing interest in email recovery. We are currently measuring demand for it, so your click on
              this option made the release one step closer.
            </Typography>

            <Typography variant="body1">Stay tuned!</Typography>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
