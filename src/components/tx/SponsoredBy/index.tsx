import { Box, Stack, SvgIcon, Tooltip, Typography } from '@mui/material'
import GasStationIcon from '@/public/images/common/gas-station.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'
import chains from '@/config/chains'
import { useCurrentChain } from '@/hooks/useChains'
import type { RelayResponse } from '@/services/tx/relaying'

export const SPONSOR_LOGOS = {
  [chains.gno]: '/images/common/gnosis-chain-logo.png',
  [chains.gor]: '/images/common/token-placeholder.svg',
}

const SponsoredBy = ({ relays, tooltip }: { relays: RelayResponse; tooltip?: string }) => {
  const chain = useCurrentChain()

  return (
    <Box className={css.sponsoredBy}>
      <SvgIcon component={GasStationIcon} inheritViewBox className={css.icon} />
      <Stack direction="column">
        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
          <Typography variant="body2" fontWeight={700} letterSpacing="0.1px">
            Sponsored by
          </Typography>
          <img src={SPONSOR_LOGOS[chain?.chainId || '']} alt={chain?.chainName} className={css.logo} />
          <Typography variant="body2" fontWeight={700} letterSpacing="0.1px">
            {chain?.chainName}
          </Typography>
          {tooltip ? (
            <Tooltip title={tooltip} placement="top" arrow>
              <span style={{ display: 'flex' }}>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  color="info"
                  fontSize="small"
                  sx={{ verticalAlign: 'middle', color: '#B2B5B2' }}
                />
              </span>
            </Tooltip>
          ) : null}
        </Stack>
        <div>
          <Typography color="primary.light">
            Transactions per hour:{' '}
            <Box component="span" sx={{ fontWeight: '700', color: 'text.primary' }}>
              {relays.remaining} of {relays.limit}
            </Box>
          </Typography>
        </div>
      </Stack>
    </Box>
  )
}

export default SponsoredBy
