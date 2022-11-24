import { useState, useRef, useEffect } from 'react'
import { Box, Dialog, DialogTitle, IconButton, Button, Divider } from '@mui/material'
import QrReader from 'react-qr-reader'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import ErrorMessage from '@/components/tx/ErrorMessage'

type Props = {
  isOpen: boolean
  onClose: () => void
  onScan: (value: string) => void
}

const ScanQRModal = ({ isOpen, onClose, onScan }: Props): React.ReactElement => {
  const [fileUploadModalOpen, setFileUploadModalOpen] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [cameraBlocked, setCameraBlocked] = useState<boolean>(false)
  const scannerRef = useRef<QrReader>(null)

  useEffect(() => {
    if (!fileUploadModalOpen && cameraBlocked && !error) {
      setFileUploadModalOpen(true)
      scannerRef.current?.openImageDialog()
    }
  }, [cameraBlocked, fileUploadModalOpen, error])

  const onFileScannedError = (error: Error) => {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDismissedError') {
      setCameraBlocked(true)
      setFileUploadModalOpen(false)
    } else {
      setError('The QR could not be read')
    }
  }

  const onFileScannedResolve = (successData: string | null) => {
    if (!successData) {
      setError('The QR could not be read')
      return
    }

    setError('')
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

      <Box display="flex" flexDirection="column" alignItems="center">
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <QrReader
          legacyMode={cameraBlocked}
          onError={onFileScannedError}
          onScan={onFileScannedResolve}
          ref={scannerRef}
          style={{ width: '400px', height: '400px' }}
        />
      </Box>

      <Divider />

      <Box display="flex" alignItems="center" justifyContent="center" padding={3} gap={2}>
        <Button variant="text" color="primary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setCameraBlocked(true)
            setError('')
            setFileUploadModalOpen(false)
          }}
        >
          Upload an image
        </Button>
      </Box>
    </Dialog>
  )
}

export default ScanQRModal
