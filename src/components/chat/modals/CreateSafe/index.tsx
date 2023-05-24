import ModalDialog from '@/components/common/ModalDialog'
import Open from '@/pages/new-safe/create'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewCreateSafe: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Apps" onClose={onClose} maxWidth="md">
      <DialogContent sx={{ maxHeight: '90vh', overflow: 'auto' }}>
        <Open />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewCreateSafe