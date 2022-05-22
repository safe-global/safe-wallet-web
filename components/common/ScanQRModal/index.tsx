import { useCallback, useEffect, createRef, useState, lazy, Suspense } from 'react'
import { Box, Dialog, DialogTitle, IconButton, Button, Divider, Alert } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
const QrReader = lazy(() => import('react-qr-reader'))

type Props = {
  isOpen: boolean
  onClose: () => void
  onScan: (value: string) => void
}

export const ScanQRModal = ({ isOpen, onClose, onScan }: Props): React.ReactElement => {
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraBlocked, setCameraBlocked] = useState<boolean>(false)
  const scannerRef = createRef<QrReader>()
  const openImageDialog = useCallback(() => {
    if (!scannerRef.current) return

    scannerRef.current.openImageDialog()
  }, [scannerRef])

  useEffect(() => {
    if (!fileUploadModalOpen && cameraBlocked && !error) {
      setFileUploadModalOpen(true)
      openImageDialog()
    }
  }, [cameraBlocked, openImageDialog, fileUploadModalOpen, setFileUploadModalOpen, error])

  const onFileScannedError = (error: Error) => {
    console.log(error)
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError') {
      setCameraBlocked(true)
      setFileUploadModalOpen(false)
    } else {
      setError('The QR could not be read')
    }
  }

  const onFileScannedResolve = (successData: string | null) => {
    console.log(successData)
    if (!successData) {
      setError('The QR could not be read')
      return
    }

    onScan(successData)
  }

  return (
    <Dialog onClose={onClose} open={isOpen}>
      <DialogTitle>
        <Typography>Scan QR</Typography>
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <Divider />
      <Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Suspense fallback={<div>Loading...</div>}>
          <QrReader
            legacyMode={cameraBlocked}
            onError={(err: Error) => onFileScannedError(err)}
            onScan={(data) => onFileScannedResolve(data)}
            ref={scannerRef}
            style={{ width: '400px', height: '400px' }}
            facingMode="user"
          />
        </Suspense>
      </Box>
      <Divider />
      <Box display="flex" alignItems="center" justifyContent="center" padding={3} gap={2}>
        <Button variant="text" color="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setCameraBlocked(true)
            setError(null)
            setFileUploadModalOpen(false)
          }}
        >
          Upload an image
        </Button>
      </Box>
    </Dialog>
  )
}
