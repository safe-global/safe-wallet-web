import type { ReactElement } from 'react'
import { Box } from '@mui/material'

import css from './styles.module.css'
import Identicon, { type IdenticonProps } from '../Identicon'

interface ThresholdProps {
  threshold: number | string
  owners: number | string
}
const Threshold = ({ threshold, owners }: ThresholdProps): ReactElement => (
  <Box
    className={css.threshold}
    sx={({ palette }) => ({
      background: palette.primary.background,
      color: palette.primary.main,
    })}
  >
    {threshold}/{owners}
  </Box>
)

interface SafeIconProps extends IdenticonProps {
  threshold?: ThresholdProps['threshold']
  owners?: ThresholdProps['owners']
}

const SafeIcon = ({ address, threshold, owners }: SafeIconProps): ReactElement => (
  <div className={css.container}>
    {threshold && owners && <Threshold threshold={threshold} owners={owners} />}
    <Identicon address={address} />
  </div>
)

export default SafeIcon
