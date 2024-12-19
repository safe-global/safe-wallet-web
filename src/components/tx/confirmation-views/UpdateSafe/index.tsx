import type { ReactNode } from 'react'
import { Alert, AlertTitle, Box, Divider, Stack, Typography } from '@mui/material'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useQueuedTxsLength } from '@/hooks/useTxQueue'
import ExternalLink from '@/components/common/ExternalLink'
import { maybePlural } from '@/utils/formatters'

function BgBox({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <Box
      flex={1}
      bgcolor={light ? 'background.light' : 'border.background'}
      p={2}
      textAlign="center"
      fontWeight={700}
      fontSize={18}
      borderRadius={1}
    >
      {children}
    </Box>
  )
}

function UpdateSafe() {
  const { safe } = useSafeInfo()
  const chain = useCurrentChain()
  const queueSize = useQueuedTxsLength()
  const latestSafeVersion = chain?.recommendedMasterCopyVersion || LATEST_SAFE_VERSION

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2}>
        <BgBox>Current version: {safe.version}</BgBox>
        <Box fontSize={28}>→</Box>
        <BgBox light>New version: {latestSafeVersion}</BgBox>
      </Stack>

      <Typography mb={1}>
        Read about the updates in the new Safe contracts version in the{' '}
        <ExternalLink href={`https://github.com/safe-global/safe-contracts/releases/tag/v${latestSafeVersion}`}>
          version {latestSafeVersion} changelog
        </ExternalLink>
      </Typography>

      {queueSize && (
        <Alert severity="warning">
          <AlertTitle sx={{ fontWeight: 700 }}>This upgrade will invalidate all queued transactions!</AlertTitle>
          You have {queueSize} unexecuted transaction{maybePlural(parseInt(queueSize))}. Please make sure to execute or
          delete them before upgrading, otherwise you&apos;ll have to reject or replace them after the upgrade.
        </Alert>
      )}

      <Divider sx={{ mt: 1, mx: -3 }} />
    </>
  )
}

export default UpdateSafe
