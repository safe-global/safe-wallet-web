import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material'
import type { ReactElement } from 'react'

import CloseIcon from '@/public/images/common/close.svg'

import css from './styles.module.css'

export default function AddEmailDialog({ open, onClose }: { open: boolean; onClose: () => void }): ReactElement {
  const onConfirm = () => {
    // TODO: Implement
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} className={css.dialog}>
      <DialogTitle className={css.title}>
        Add email address
        <IconButton onClick={onClose} className={css.close}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className={css.content}>
        <DialogContentText color="text.primary" mb={3}>
          You will need to sign a message to verify that you are the owner of this Safe Account.
        </DialogContentText>

        <TextField type="email" label="Email address" variant="outlined" fullWidth InputLabelProps={{ shrink: true }} />
      </DialogContent>

      <DialogActions className={css.actions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
