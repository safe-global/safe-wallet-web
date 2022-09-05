import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import usePairingUri from '@/services/pairing/hooks'
import QRCode from '@/components/common/QRCode'
import PairingDescription from './PairingDescription'

const QR_CODE_SIZE = 100

const PairingDetails = ({ vertical = false }: { vertical?: boolean }): ReactElement => {
  const uri = usePairingUri()

  const title = <Typography variant="h5">Connect to mobile</Typography>

  const qr = <QRCode value={uri} size={QR_CODE_SIZE} />

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
