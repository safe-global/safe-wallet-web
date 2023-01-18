import type { ReactElement } from 'react'
import { Box, Tooltip } from '@mui/material'

import css from './styles.module.css'
import Identicon, { type IdenticonProps } from '../Identicon'
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

const PendingActionsBadge = ({ queuedTxs }: { queuedTxs: number }): ReactElement => (
  <Tooltip title="queued transactions at this Safe" placement="top">
    <Box className={classnames(css.badge, css.pending)} sx={{ color: ({ palette }) => palette.static.main }}>
      {queuedTxs}
    </Box>
  </Tooltip>
)

interface SafeIconProps extends IdenticonProps {
  threshold?: ThresholdProps['threshold']
  owners?: ThresholdProps['owners']
  size?: number
  queuedTxs?: number
}

const SafeIcon = ({ address, threshold, owners, size, queuedTxs }: SafeIconProps): ReactElement => (
  <div className={css.container}>
    {threshold && owners ? <Threshold threshold={threshold} owners={owners} /> : null}
    <Identicon address={address} size={size} />
    {!!queuedTxs && <PendingActionsBadge queuedTxs={queuedTxs} />}
  </div>
)

export default SafeIcon
