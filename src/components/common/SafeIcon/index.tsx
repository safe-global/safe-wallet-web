import type { ReactElement } from 'react'
import { Box, Tooltip } from '@mui/material'

import css from './styles.module.css'
import Identicon, { type IdenticonProps } from '../Identicon'
import type { SafeActions } from '@/components/sidebar/SafeList'
import classnames from 'classnames'

interface ThresholdProps {
  threshold: number | string
  owners: number | string
}
const Threshold = ({ threshold, owners }: ThresholdProps): ReactElement => (
  <Box className={classnames(css.badge, css.threshold)} sx={{ color: ({ palette }) => palette.static.main }}>
    {threshold}/{owners}
  </Box>
)

const RequiredActionsBadge = ({ signing, execution }: SafeActions): ReactElement => (
  <Tooltip title={`${signing} required action(s)`} placement="top">
    <Box className={classnames(css.badge, css.required)} sx={{ color: ({ palette }) => palette.static.main }}>
      {signing}/{execution}
    </Box>
  </Tooltip>
)

interface SafeIconProps extends IdenticonProps {
  threshold?: ThresholdProps['threshold']
  owners?: ThresholdProps['owners']
  size?: number
  requiredActions?: SafeActions
}

const SafeIcon = ({ address, threshold, owners, size, requiredActions }: SafeIconProps): ReactElement => (
  <div className={css.container}>
    {threshold && owners ? <Threshold threshold={threshold} owners={owners} /> : null}
    <Identicon address={address} size={size} />
    {requiredActions !== undefined && (
      <RequiredActionsBadge signing={requiredActions.signing} execution={requiredActions.execution} />
    )}
  </div>
)

export default SafeIcon
