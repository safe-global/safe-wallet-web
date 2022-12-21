import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { createRoot } from 'react-dom/client'
import CloseIcon from '@mui/icons-material/Close'
import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import PairingDescription from '@/components/common/PairingDetails/PairingDescription'
import { StoreHydrator } from '@/store'
import { AppProviders } from '@/pages/_app'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import css from './styles.module.css'

const WRAPPER_ID = 'safe-mobile-qr-modal'
const QR_CODE_SIZE = 200

const renderWrapper = () => {
  if (typeof document === 'undefined') {
    return
  }

  const wrapper = document.createElement('div')
  wrapper.setAttribute('id', WRAPPER_ID)

  document.body.appendChild(wrapper)

  return wrapper
}

const open = (uri: string, cb: () => void) => {
  const wrapper = renderWrapper()

  if (!wrapper) {
    return
  }

  const root = createRoot(wrapper)

  root.render(<Modal uri={uri} cb={cb} />)
}

const close = () => {
  if (typeof document === 'undefined') {
    return
  }

  const wrapper = document.getElementById(WRAPPER_ID)
  if (wrapper) {
    document.body.removeChild(wrapper)
  }
}

const Modal = ({ uri, cb }: { uri: string; cb: () => void }) => {
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    cb()
    setOpen(false)
    close()
  }

  return (
    <StoreHydrator>
      <AppProviders>
        <Dialog open={open} onClose={handleClose} disablePortal className={css.modal}>
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
            <PairingQRCode size={QR_CODE_SIZE} />
            <br />
            <PairingDescription />
          </DialogContent>
        </Dialog>
      </AppProviders>
    </StoreHydrator>
  )
}

const QRModal = {
  open,
  close,
}

export default QRModal
