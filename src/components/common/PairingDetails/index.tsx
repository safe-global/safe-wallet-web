import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import PairingQRCode from './PairingQRCode'
import PairingDescription from './PairingDescription'

const PairingDetails = ({ vertical = false }: { vertical?: boolean }): ReactElement => {
  const title = <Typography variant="h5">Connect to mobile</Typography>

  const description = <PairingDescription />

  const qr = <PairingQRCode />

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
