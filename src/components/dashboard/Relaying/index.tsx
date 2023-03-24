import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Box, Card, Divider, Skeleton, Stack, SvgIcon, Typography } from '@mui/material'
import useRemainingRelays from '@/hooks/useRemainingRelays'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import InfoIcon from '@/public/images/notifications/info.svg'
import GasStationIcon from '@/public/images/common/gas-station.svg'
import ExternalLink from '@/components/common/ExternalLink'
import classnames from 'classnames'
import css from './styles.module.css'

const MAX_HOUR_RELAYS = 5

const Relaying = () => {
  const [remainingRelays, remainingRelaysError] = useRemainingRelays()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        New in Safe
      </Typography>

      <WidgetBody>
        <Card sx={{ padding: 4, height: 'inherit' }}>
          <Box mb={2}>
            <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
              <Box className={css.icon}>
                <SvgIcon component={GasStationIcon} fontWeight={700} inheritViewBox />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Gas fees sponsored by
              </Typography>
              <img src="/images/common/GnosisChainLogo.png" alt="Gnosis Chain" className={css.gcLogo} />
              <Typography variant="h6" fontWeight={700} flexShrink={0}>
                Gnosis Chain
              </Typography>
            </Stack>
            <Typography variant="body2" marginRight={1} sx={{ display: 'inline' }}>
              Benefit from gasless experience powered by Gelato and Safe. Experience gasless UX for the next month!
            </Typography>
            <Track {...OVERVIEW_EVENTS.RELAYING_HELP_ARTICLE}>
              {/* TODO: change the href when creating the help article */}
              <ExternalLink href="#">Read more</ExternalLink>
            </Track>
          </Box>
          <Divider />
          <Box mt={3} display="flex">
            <Typography color="primary.light">Transactions per hour</Typography>
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
