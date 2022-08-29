import { Typography, Link } from '@mui/material'
import type { ReactElement } from 'react'

import AppStoreButton from '@/components/common/AppStoreButton'

const HELP_ARTICLE = 'https://help.gnosis-safe.io/en/articles/5584901-desktop-pairing'
const APPSTORE_LINK = 'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Connect&mt=8'

const PairingDescription = (): ReactElement => {
  return (
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
}

export default PairingDescription
