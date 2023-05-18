import ModalDialog from '@/components/common/ModalDialog'
import Balances from '@/pages/balances'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewAssetsModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Assets" onClose={onClose} maxWidth="md">
      <DialogContent>
        <Balances />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewAssetsModal
