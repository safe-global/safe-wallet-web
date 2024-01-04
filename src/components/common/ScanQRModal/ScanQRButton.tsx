import React, { lazy, useState, Suspense, type ReactElement } from 'react'
import QrCodeIcon from '@/public/images/common/qr.svg'
import { IconButton, SvgIcon } from '@mui/material'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'

const ScanQRModal = lazy(() => import('.'))

type Props = {
  onScan: (value: string) => void
}

const ScanQRButton = ({ onScan }: Props): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)

  const openQrModal = () => {
    setOpen(true)
    trackEvent(MODALS_EVENTS.SCAN_QR)
  }

  const closeQrModal = () => {
    setOpen(false)
  }

  const onScanFinished = (value: string) => {
    onScan(value)
    closeQrModal()
    trackEvent(MODALS_EVENTS.SCAN_QR_FINISHED)
  }

  return (
    <>
      <IconButton data-testid="address-qr-scan" onClick={openQrModal}>
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
