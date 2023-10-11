import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import type { CoreTypes } from '@walletconnect/types'

import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import SafeLogo from '@/public/images/logo-no-text.svg'
import ConnectionDots from '@/public/images/common/connection-dots.svg'

import css from './styles.module.css'

export const SuccessBanner = ({ metadata }: { metadata: CoreTypes.Metadata }): ReactElement => {
  return (
    <div className={css.container}>
      <div>
        <SafeLogo alt="Safe logo" width="28px" height="28px" />
        <SvgIcon component={ConnectionDots} inheritViewBox sx={{ mx: 2 }} />
        <SafeAppIconCard src={metadata.icons[0]} width={28} height={28} alt={`${metadata.name} logo`} />
      </div>
      <Typography variant="h5" mt={3}>
        {metadata.name} successfully connected!
      </Typography>
    </div>
  )
}
