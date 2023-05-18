import ModalDialog from '@/components/common/ModalDialog'
import Setup from '@/pages/settings/setup'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewSettingsModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Settings" onClose={onClose} maxWidth="md">
      <DialogContent>
        <Setup />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewSettingsModal
