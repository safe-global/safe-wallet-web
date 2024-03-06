import WarningIcon from '@/public/images/notifications/warning.svg'
import { TX_LIST_EVENTS, trackEvent } from '@/services/analytics'
import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  SvgIcon,
  Typography,
} from '@mui/material'
import { useEffect, type ReactElement, type SyntheticEvent } from 'react'
import Track from '../Track'

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
        <Box
          data-sid="53736"
          data-testid="untrusted-token-warning"
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={1}
        >
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
        <Track {...TX_LIST_EVENTS.COPY_WARNING_PROCEED}>
          <Button data-sid="70187" size="small" variant="outlined" color="primary" onClick={onCopy}>
            Proceed and copy
          </Button>
        </Track>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmCopyModal
