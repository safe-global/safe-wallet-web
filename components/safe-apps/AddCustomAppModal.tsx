import { DialogActions, DialogContent, Typography, Button } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'

type Props = {
  open: boolean
  onClose: () => void
}

const AddCustomAppModal = ({ open, onClose }: Props) => {
  return (
    <ModalDialog open={open} onClose={onClose} title="Add custom app">
      <DialogContent>
        <Typography>You just created a new Safe on</Typography>
        <Typography>It can take a few minutes until its fully usable.</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Ok
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export { AddCustomAppModal }
