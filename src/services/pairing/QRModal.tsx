import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { createRoot } from 'react-dom/client'
import CloseIcon from '@mui/icons-material/Close'

import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import { formatPairingUri } from '@/services/pairing/utils'
import PairingDescription from '@/components/common/PairingDetails/PairingDescription'
import { StoreHydrator } from '@/store'
import { AppProviders } from '@/pages/_app'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'

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

const open = (uri: string) => {
  const wrapper = renderWrapper()

  if (!wrapper) {
    return
  }

  const root = createRoot(wrapper)

  root.render(<QRModal uri={uri} />)
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

const QRModal = ({ uri }: { uri: string }) => {
  // TODO: Can this be rendered inside the tree?
  return (
    <StoreHydrator>
      <AppProviders>
        {/* TODO: Close not working */}
        <Dialog open onClose={close}>
          <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
            {PAIRING_MODULE_LABEL}
            <IconButton
              onClick={close}
              size="small"
              sx={{
                ml: 2,
                color: 'border.main',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <PairingQRCode uri={formatPairingUri(uri)} size={QR_CODE_SIZE} />
            <br />
            <PairingDescription />
          </DialogContent>
        </Dialog>
      </AppProviders>
    </StoreHydrator>
  )
}

export default { open, close }
