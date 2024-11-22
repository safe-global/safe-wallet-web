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
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
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
  isMobile = false,
}: {
  safeAddress: string
  chainShortName: string
  queued: number
  awaitingConfirmation: number
  isMobile?: boolean
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
    <Track {...OVERVIEW_EVENTS.OPEN_MISSING_SIGNATURES}>
      <NextLink href={queueLink}>
        <Box
          sx={{
            px: isMobile ? 2 : 0,
            pb: isMobile ? 2 : 0,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          {queued > 0 && (
            <ChipLink>
              <SvgIcon component={TransactionsIcon} inheritViewBox sx={{ fontSize: 'small' }} />
              {queued} pending
            </ChipLink>
          )}

          {awaitingConfirmation > 0 && (
            <ChipLink color="warning">
              <SvgIcon component={CheckIcon} inheritViewBox sx={{ fontSize: 'small', color: 'warning' }} />
              {awaitingConfirmation} to confirm
            </ChipLink>
          )}
        </Box>
      </NextLink>
    </Track>
  )
}

export default QueueActions
