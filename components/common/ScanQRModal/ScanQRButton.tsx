import React, { ReactElement, useState } from 'react'

import { ScanQRModal } from './index'
import QrCodeIcon from '@mui/icons-material/QrCode'
import { IconButton } from '@mui/material'

type Props = {
  onScan: (value: string) => void
}

export const ScanQRButton = ({ onScan }: Props): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)

  const openQrModal = () => {
    setOpen(true)
  }

  const closeQrModal = () => {
    setOpen(false)
  }

  const onScanFinished = (value: string) => {
    onScan(value)
    closeQrModal()
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
