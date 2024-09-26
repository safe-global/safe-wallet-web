import { Stack, Box, Typography } from '@mui/material'
import { getIndexingStatus } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import ExternalLink from '@/components/common/ExternalLink'

const STATUS_PAGE = 'https://status.safe.global'
const MAX_SYNC_DELAY = 1000 * 60 * 5 // 5 minutes

const useIndexingStatus = () => {
  const chainId = useChainId()

  return useAsync(() => {
    return getIndexingStatus(chainId)
  }, [chainId])
}

const STATUSES = {
  synced: {
    color: 'success',
    text: 'Synced',
  },
  slow: {
    color: 'warning',
    text: 'Slow network',
  },
  outOfSync: {
    color: 'error',
    text: 'Out of sync',
  },
}

const IndexingStatus = () => {
  const [data] = useIndexingStatus()

  if (!data) {
    return null
  }

  const status = data.synced
    ? STATUSES.synced
    : Date.now() - data.lastSync > MAX_SYNC_DELAY
    ? STATUSES.slow
    : STATUSES.outOfSync

  return (
    <Stack direction="row" spacing={2} alignItems="center" px={3} py={1.5}>
      <Box width={10} height={10} borderRadius="50%" border={`2px solid var(--color-${status.color}-main)`} />

      <ExternalLink href={STATUS_PAGE} noIcon flex={1}>
        <Typography variant="body2">{status.text}</Typography>
      </ExternalLink>

      <ExternalLink href={STATUS_PAGE} sx={{ color: 'text.secondary', transform: 'translateY(2px)' }} />
    </Stack>
  )
}

export default IndexingStatus
