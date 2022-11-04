import React, { lazy, useState, Suspense, type ReactElement } from 'react'
import QrCodeIcon from '@/public/images/common/qr.svg'
import { IconButton, SvgIcon } from '@mui/material'

const ScanQRModal = lazy(() => import('.'))

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
        <SvgIcon component={QrCodeIcon} inheritViewBox color="primary" fontSize="small" />
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
