import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import Identicon, { type IdenticonProps } from '../Identicon'
import css from './styles.module.css'

interface ThresholdProps {
  threshold: number | string
  owners: number | string
}
const Threshold = ({ threshold, owners }: ThresholdProps): ReactElement => (
  <Box data-sid="36199" className={css.threshold} sx={{ color: ({ palette }) => palette.static.main }}>
    {threshold}/{owners}
  </Box>
)

interface SafeIconProps extends IdenticonProps {
  threshold?: ThresholdProps['threshold']
  owners?: ThresholdProps['owners']
  size?: number
}

const SafeIcon = ({ address, threshold, owners, size }: SafeIconProps): ReactElement => (
  <div data-sid="66580" className={css.container}>
    {threshold && owners ? <Threshold threshold={threshold} owners={owners} /> : null}
    <Identicon address={address} size={size} />
  </div>
)

export default SafeIcon
