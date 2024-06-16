import { useMemo, type ReactNode } from 'react'
import type { UrlObject } from 'url'
import NextLink from 'next/link'
import { Box, Chip, Typography, SvgIcon } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import TransactionsIcon from '@/public/images/transactions/transactions.svg'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { AppRoutes } from '@/config/routes'

const ChipLink = ({ children, color }: { children: ReactNode; color?: string }) => (
  <Chip
    size="small"
    sx={{ backgroundColor: `${color}.background` }}
    label={
      <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
        {children}
      </Typography>
    }
  />
)

const QueueActions = ({
  safeAddress,
  chainShortName,
  queued,
  awaitingConfirmation,
}: {
  safeAddress: string
  chainShortName: string
  queued: number
  awaitingConfirmation: number
}) => {
  const queueLink = useMemo<UrlObject>(
    () => ({
      pathname: AppRoutes.transactions.queue,
      query: { safe: `${chainShortName}:${safeAddress}` },
    }),
    [chainShortName, safeAddress],
  )

  if (!queued && !awaitingConfirmation) {
    return null
  }

  return (
    <Box width="100%">
      <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
        <NextLink href={queueLink}>
          <Box px={2} pb={2} display="flex" gap={1} alignItems="center">
            {queued > 0 && (
              <ChipLink>
                <SvgIcon component={TransactionsIcon} inheritViewBox fontSize="small" />
                {queued} pending transaction{queued > 1 ? 's' : ''}
              </ChipLink>
            )}

            {awaitingConfirmation > 0 && (
              <ChipLink color="warning">
                <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" color="warning" />
                {awaitingConfirmation} to confirm
              </ChipLink>
            )}
          </Box>
        </NextLink>
      </Track>
    </Box>
  )
}

export default QueueActions
