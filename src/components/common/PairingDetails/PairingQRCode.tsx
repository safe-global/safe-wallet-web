import QRCode from 'qrcode.react'
import { Skeleton } from '@mui/material'
import type { ReactElement } from 'react'

const QR_LOGO_SIZE = 30

const PairingQRCode = ({
  uri,
  size,
  ...color
}: {
  uri?: string
  fgColor?: string
  bgColor?: string
  size: number
}): ReactElement => {
  return uri ? (
    <QRCode
      value={uri}
      size={size}
      {...color}
      imageSettings={{
        src: '/logo-no-text.svg',
        width: QR_LOGO_SIZE,
        height: QR_LOGO_SIZE,
        excavate: true,
      }}
    />
  ) : (
    <Skeleton variant="rectangular" width={size} height={size} />
  )
}

export default PairingQRCode
