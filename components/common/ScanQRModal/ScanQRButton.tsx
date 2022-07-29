import React, { useState, Suspense, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import QrCodeIcon from '@mui/icons-material/QrCode'
import { IconButton } from '@mui/material'

const ScanQRModal = dynamic(() => import('.'))

type Props = {
  onScan: (value: string) => void
}

const ScanQRButton = ({ onScan }: Props): ReactElement => {
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

      {open && (
        <Suspense>
          <ScanQRModal isOpen={open} onClose={closeQrModal} onScan={onScanFinished} />
        </Suspense>
      )}
    </>
  )
}

export default ScanQRButton
