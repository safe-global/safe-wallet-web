import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import AppStoreButton from '@/components/common/AppStoreButton'
import ExternalLink from '../ExternalLink'
import { HelpCenterArticle } from '@/config/constants'

const PairingDescription = (): ReactElement => {
  return (
    <>
      <Typography variant="caption" align="center">
        Scan this code in the Safe Mobile app to sign transactions with your mobile device.
        <br />
        <ExternalLink href={HelpCenterArticle.DESKTOP_PAIRING} title="Learn more about mobile pairing.">
          Learn more about this feature.
        </ExternalLink>
      </Typography>

      <AppStoreButton placement="pairing" />
    </>
  )
}

export default PairingDescription
