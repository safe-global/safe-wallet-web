import QRCode from 'qrcode.react'
import { Skeleton } from '@mui/material'
import { useTheme } from '@mui/system'
import type { ReactElement } from 'react'

const QR_LOGO_SIZE = 20

const PairingQRCode = ({ uri, size }: { uri?: string; size: number }): ReactElement => {
  const { palette } = useTheme()

  return uri ? (
    <QRCode
      value={uri}
      size={size}
      bgColor={palette.background.paper}
      fgColor={palette.text.primary}
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
