import ModalDialog from '@/components/common/ModalDialog'
import HistoryPage from '@/pages/transactions'
import { DialogContent } from '@mui/material'
import React from 'react'

const ViewTransactionsModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <ModalDialog open={open} dialogTitle="View Transactions" onClose={onClose} maxWidth="md">
      <DialogContent sx={{ maxHeight: '90vh', overflow: 'auto' }}>
        <HistoryPage />
      </DialogContent>
    </ModalDialog>
  )
}

export default ViewTransactionsModal
