import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import PairingDescription from '@/components/common/PairingDetails/PairingDescription'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import PairingDeprecationWarning from '@/components/common/PairingDetails/PairingDeprecationWarning'
import ExternalStore from '@/services/ExternalStore'

const { useStore: useCloseCallback, setStore: setCloseCallback } = new ExternalStore<() => void>()

export const open = (cb: () => void) => {
  setCloseCallback(() => cb)
}

export const close = () => {
  setCloseCallback(undefined)
}

const QRModal = () => {
  const closeCallback = useCloseCallback()
  const open = !!closeCallback

  const handleClose = () => {
    closeCallback?.()
    setCloseCallback(undefined)
    close()
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={handleClose} disablePortal sx={{ zIndex: 100000 }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between' }}>
        {PAIRING_MODULE_LABEL}
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: 'border.main',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <PairingDeprecationWarning />
        <PairingQRCode size={200} />
        <br />
        <PairingDescription />
      </DialogContent>
    </Dialog>
  )
}

export default QRModal
