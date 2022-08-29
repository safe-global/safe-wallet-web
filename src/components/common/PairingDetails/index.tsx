import { useTheme } from '@mui/system'
import { Typography, Link } from '@mui/material'
import type { ReactElement } from 'react'

import usePairing from '@/services/pairing/usePairing'
import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'
import AppStoreButton from '@/components/common/AppStoreButton'

const QR_CODE_SIZE = 100

const HELP_ARTICLE = 'https://help.gnosis-safe.io/en/articles/5584901-desktop-pairing'
const APPSTORE_LINK = 'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Connect&mt=8'

// TODO: Horizontal styling
const PairingDetails = (): ReactElement => {
  const { palette } = useTheme()

  const { uri } = usePairing()

  const title = <Typography variant="h5">Connect to mobile</Typography>

  const qr = (
    <PairingQRCode uri={uri} bgColor={palette.background.paper} fgColor={palette.text.primary} size={QR_CODE_SIZE} />
  )

  const description = (
    <>
      <Typography variant="caption" align="center">
        Scan this code in the Safe mobile app to sign transactions with your mobile device.
        <br />
        <Link href={HELP_ARTICLE} target="_blank" rel="noreferrer" title="Learn more about mobile pairing.">
          Learn more about this feature.
        </Link>
      </Typography>

      {/* TODO: Tracking */}
      <AppStoreButton href={APPSTORE_LINK} />
    </>
  )

  return (
    <>
      {title}
      {qr}
      {description}
    </>
  )
}

export default PairingDetails
