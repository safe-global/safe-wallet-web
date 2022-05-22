import React, { ReactElement, useState } from 'react'

import { ScanQRModal } from './index'
import QrCodeIcon from '@mui/icons-material/QrCode'
import { IconButton } from '@mui/material'

type Props = {
  handleScan: (dataResult: string, closeQrModal: () => void) => void
}

export const ScanQRButton = ({ handleScan }: Props): ReactElement => {
  const [open, setOpen] = useState(false)

  const openQrModal = () => {
    setOpen(true)
  }

  const closeQrModal = () => {
    setOpen(false)
  }

  const onScanFinished = (value: string) => {
    handleScan(value, closeQrModal)
  }

  return (
    <>
      <IconButton onClick={openQrModal}>
        <QrCodeIcon />
      </IconButton>
      {open && <ScanQRModal isOpen={open} onClose={closeQrModal} onScan={onScanFinished} />}
    </>
  )
}
