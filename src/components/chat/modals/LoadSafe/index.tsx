import Load from '@/pages/new-safe/load'
import ModalDialog from '@/components/common/ModalDialog'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewLoadSafe: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Apps" onClose={onClose} maxWidth="md">
      <DialogContent sx={{ maxHeight: '90vh', overflow: 'auto' }}>
        <Load />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewLoadSafe