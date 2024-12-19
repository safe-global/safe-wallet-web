import * as React from 'react'
import { DialogActions, DialogContent, Typography, Button } from '@mui/material'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import ModalDialog from '@/components/common/ModalDialog'

type Props = {
  open: boolean
  app: SafeAppData
  onClose: () => void
  onConfirm: (appId: number) => void
}

const RemoveCustomAppModal = ({ open, onClose, onConfirm, app }: Props) => (
  <ModalDialog open={open} onClose={onClose} dialogTitle="Confirm Safe App removal">
    <DialogContent>
      <Typography variant="h6" pt={3}>
        Are you sure you want to remove the <b>{app.name}</b> app?
      </Typography>
    </DialogContent>
    <DialogActions disableSpacing>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={() => onConfirm(app.id)}>
        Remove
      </Button>
    </DialogActions>
  </ModalDialog>
)

export { RemoveCustomAppModal }
