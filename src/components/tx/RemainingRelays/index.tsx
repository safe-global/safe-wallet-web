import { SvgIcon, Tooltip, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { RelayResponse } from '@/services/tx/relaying'
import { MAX_HOUR_RELAYS } from '@/hooks/useRemainingRelays'
import css from '../BalanceInfo/styles.module.css'

const RemainingRelays = ({ relays, tooltip }: { relays?: RelayResponse; tooltip?: string }) => {
  if (!tooltip) {
    tooltip = `${relays?.limit ?? MAX_HOUR_RELAYS} transactions per hour for free`
  }

  return (
    <div className={css.container}>
      <Typography variant="body2" color="primary.light" display="flex" alignItems="center" gap={0.5}>
        <b>{relays?.remaining ?? MAX_HOUR_RELAYS}</b> free transactions left this hour
        <Tooltip title={tooltip} placement="top" arrow>
          <span style={{ lineHeight: 0 }}>
            <SvgIcon component={InfoIcon} inheritViewBox color="info" fontSize="small" sx={{ color: '#B2B5B2' }} />
          </span>
        </Tooltip>
      </Typography>
    </div>
  )
}

export default RemainingRelays
