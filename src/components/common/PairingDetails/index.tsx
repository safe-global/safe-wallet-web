import { useTheme } from '@mui/system'
import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import usePairing from '@/services/pairing/usePairing'
import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import PairingDescription from './PairingDescription'

const QR_CODE_SIZE = 100

const PairingDetails = ({ vertical = false }: { vertical?: boolean }): ReactElement => {
  const { palette } = useTheme()

  const { uri } = usePairing()

  const title = <Typography variant="h5">Connect to mobile</Typography>

  const qr = (
    <PairingQRCode uri={uri} bgColor={palette.background.paper} fgColor={palette.text.primary} size={QR_CODE_SIZE} />
  )

  const description = <PairingDescription />

  return (
    <>
      {vertical ? (
        <>
          {title}
          {qr}
          {description}
        </>
      ) : (
        <>
          {qr}
          <div>
            {title}
            {description}
          </div>
        </>
      )}
    </>
  )
}

export default PairingDetails
