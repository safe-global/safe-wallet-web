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

const SponsoredBy = ({
  relays,
  tooltip,
  shouldRelay,
}: {
  relays?: RelayResponse
  tooltip?: string
  shouldRelay: boolean
}) => {
  const chain = useCurrentChain()

  return (
    <Box className={css.sponsoredBy}>
      <SvgIcon component={GasStationIcon} inheritViewBox className={css.icon} />

      {shouldRelay ? (
        <div>
          <Stack direction="row" spacing={0.5} alignItems="center">
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

          <Typography variant="body2" color="primary.light">
            Transactions per hour:{' '}
            <Box component="span" sx={{ fontWeight: '700', color: 'text.primary' }}>
              {relays?.remaining ?? 0} of {relays?.limit ?? 0}
            </Box>
            {relays && !relays.remaining && (
              <Box component="span" sx={{ color: 'error.main' }}>
                {' '}
                &mdash; will reset in the next hour
              </Box>
            )}
          </Typography>
        </div>
      ) : (
        <div>
          <Typography variant="body2" fontWeight={700} letterSpacing="0.1px">
            Pay gas from the connected wallet
          </Typography>

          <Typography variant="body2" color="primary.light">
            Please make sure your wallet has sufficient funds.
          </Typography>
        </div>
      )}
    </Box>
  )
}

export default SponsoredBy
