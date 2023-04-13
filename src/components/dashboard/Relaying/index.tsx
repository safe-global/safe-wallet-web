import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Box, Card, Divider, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import { useRemainingRelaysBySafe } from '@/hooks/useRemainingRelays'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import InfoIcon from '@/public/images/notifications/info.svg'
import GasStationIcon from '@/public/images/common/gas-station.svg'
import ExternalLink from '@/components/common/ExternalLink'
import classnames from 'classnames'
import css from './styles.module.css'
import { MAX_HOUR_RELAYS } from '@/components/tx/SponsoredBy'

const RELAYING_HELP_ARTICLE = 'https://help.safe.global/en/articles/7224713-what-is-gas-fee-sponsoring'

const Relaying = () => {
  const [remainingRelays, remainingRelaysError] = useRemainingRelaysBySafe()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        New in Safe
      </Typography>

      <WidgetBody>
        <Card sx={{ padding: 4, height: 'inherit' }}>
          <Box mb={4}>
            <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
              <Box className={css.icon}>
                <SvgIcon component={GasStationIcon} fontWeight={700} inheritViewBox />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Gas fees sponsored by
              </Typography>
              <img src="/images/common/gnosis-chain-logo.png" alt="Gnosis Chain" className={css.gcLogo} />
              <Typography variant="h6" fontWeight={700} flexShrink={0}>
                Gnosis Chain
              </Typography>
            </Stack>
            <Typography variant="body2" marginRight={1} sx={{ display: 'inline' }}>
              Benefit from a gasless experience powered by Gelato and Safe. Experience gasless UX for the next month!
            </Typography>
            <Track {...OVERVIEW_EVENTS.RELAYING_HELP_ARTICLE}>
              <ExternalLink href={RELAYING_HELP_ARTICLE}>Read more</ExternalLink>
            </Track>
          </Box>
          <Divider />
          <Box mt={4} display="flex" justifyContent="space-between">
            <Typography color="primary.light" alignSelf="center">
              Transactions per hour
            </Typography>
            <Box className={classnames(css.relayingChip, { [css.unavailable]: remainingRelays === 0 })}>
              <SvgIcon component={InfoIcon} fontSize="small" />
              {remainingRelaysError ? (
                <Typography fontWeight={700}>{MAX_HOUR_RELAYS} per hour</Typography>
              ) : remainingRelays !== undefined ? (
                <Typography fontWeight={700}>
                  {remainingRelays} of {MAX_HOUR_RELAYS}
                </Typography>
              ) : (
                <Skeleton className={css.chipSkeleton} variant="rounded" />
              )}
            </Box>
          </Box>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default Relaying
