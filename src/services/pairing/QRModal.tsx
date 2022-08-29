import { Dialog, DialogContent } from '@mui/material'
import { createRoot } from 'react-dom/client'

import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import { formatPairingUri } from '@/services/pairing/utils'

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
  return (
    <Dialog open onClose={close}>
      <DialogContent>
        <PairingQRCode uri={formatPairingUri(uri)} size={QR_CODE_SIZE} />
      </DialogContent>
    </Dialog>
  )
}

export default { open, close }
