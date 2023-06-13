import { Dialog, DialogTitle, DialogContent, DialogContentText, Typography, DialogActions, Button } from '@mui/material'

export const ConfirmationDialog = ({
  open,
  onCancel,
  onClose,
}: {
  open: boolean
  onCancel: () => void
  onClose: () => void
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">Cancel message signing request</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        <Typography variant="body2">If you close this modal, the signing request will be aborted.</Typography>
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="contained" onClick={onClose} autoFocus>
        Abort signing
      </Button>
    </DialogActions>
  </Dialog>
)
