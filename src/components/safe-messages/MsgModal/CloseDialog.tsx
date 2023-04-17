import { type SetStateAction } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

const CloseDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: (value: SetStateAction<boolean>) => void
  onConfirm: () => void
}) => {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>Are you sure you want to close the modal without a fully signed message?</DialogTitle>
      <DialogContent>
        <DialogContentText>Messages that are not fully signed by the multisig NGMI.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} autoFocus>
          Please no!
        </Button>
        <Button onClick={onConfirm} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CloseDialog
