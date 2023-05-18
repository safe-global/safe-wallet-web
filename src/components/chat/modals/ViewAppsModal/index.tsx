import ModalDialog from '@/components/common/ModalDialog'
import SafeApps from '@/pages/apps'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewAppsModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Apps" onClose={onClose} maxWidth="md">
      <DialogContent sx={{ maxHeight: '90vh', overflow: 'auto' }}>
        <SafeApps />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewAppsModal
