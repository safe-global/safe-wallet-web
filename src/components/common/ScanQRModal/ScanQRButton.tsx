import React, { lazy, useState, Suspense, type ReactElement } from 'react'
import QrCodeIcon from '@/public/images/common/qr.svg'
import { IconButton, SvgIcon } from '@mui/material'
import Track from '../Track'
import { MODALS_EVENTS } from '@/services/analytics'

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
      <Track {...MODALS_EVENTS.SCAN_QR}>
        <IconButton onClick={openQrModal}>
          <SvgIcon component={QrCodeIcon} inheritViewBox color="primary" fontSize="small" />
        </IconButton>
      </Track>

      {open && (
        <Suspense>
          <ScanQRModal isOpen={open} onClose={closeQrModal} onScan={onScanFinished} />
        </Suspense>
      )}
    </>
  )
}

export default ScanQRButton
