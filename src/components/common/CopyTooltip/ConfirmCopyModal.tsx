import { Close } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  SvgIcon,
  Typography,
  IconButton,
  Divider,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { type ReactElement, useEffect, type SyntheticEvent } from 'react'
import { trackEvent, TX_LIST_EVENTS } from '@/services/analytics'
import Track from '../Track'

import css from './styles.module.css'

export type ConfirmCopyModalProps = {
  open: boolean
  onClose: () => void
  onCopy: { (e: SyntheticEvent): void }
  children: ReactElement
}

const ConfirmCopyModal = ({ open, onClose, onCopy, children }: ConfirmCopyModalProps) => {
  useEffect(() => {
    if (open) {
      trackEvent(TX_LIST_EVENTS.COPY_WARNING_SHOWN)
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box data-testid="untrusted-token-warning" display="flex" flexDirection="row" alignItems="center" gap={1}>
          <SvgIcon component={WarningIcon} inheritViewBox color="warning" sx={{ mb: -0.4 }} />
          <Typography variant="h6" fontWeight={700}>
            Before you copy
          </Typography>
          <IconButton aria-label="close" onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>{children}</DialogContent>
      <Divider />
      <DialogActions sx={{ padding: 3 }}>
        <Box className={css.dialogActions} gap={1}>
          <Track {...TX_LIST_EVENTS.COPY_WARNING_PROCEED}>
            <Button size="small" variant="text" color="primary" onClick={onCopy} fullWidth>
              Proceed and copy
            </Button>
          </Track>
          <Track {...TX_LIST_EVENTS.COPY_WARNING_CLOSE}>
            <Button size="small" variant="contained" color="primary" onClick={onClose} fullWidth>
              Do not copy
            </Button>
          </Track>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmCopyModal
