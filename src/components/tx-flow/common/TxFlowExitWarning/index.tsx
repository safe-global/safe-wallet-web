import { DialogContent, DialogContentText, DialogActions, Button, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import AlertIcon from '@/public/images/notifications/alert.svg'
import { useDarkMode } from '@/hooks/useDarkMode'

export const TxFlowExitWarning = ({
  open,
  onCancel,
  onClose,
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
}): ReactElement => {
  const isDarkMode = useDarkMode()
  return (
    <ModalDialog
      open={open}
      onClose={onCancel}
      dialogTitle={
        <>
          <SvgIcon
            component={AlertIcon}
            inheritViewBox
            fontSize="inherit"
            color="error"
            sx={{ verticalAlign: 'middle', mr: '12px' }}
          />{' '}
          Are you sure?
        </>
      }
    >
      <DialogContent sx={{ p: 'var(--space-3) !important' }}>
        <DialogContentText color={isDarkMode ? undefined : 'primary'}>
          Closing this window will discard your current progress.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: 'var(--space-2) var(--space-3) !important' }}>
        <Button onClick={onCancel}>Back to editing</Button>
        <Button variant="contained" onClick={onClose}>
          Leave
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}
