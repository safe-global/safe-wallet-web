import { Alert, AlertTitle, Divider, Typography } from '@mui/material'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useQueuedTxsLength } from '@/hooks/useTxQueue'
import ExternalLink from '@/components/common/ExternalLink'
import { maybePlural } from '@/utils/formatters'

function UpdateSafe() {
  const { safe } = useSafeInfo()
  const chain = useCurrentChain()
  const queueSize = useQueuedTxsLength()
  const latestSafeVersion = chain?.recommendedMasterCopyVersion || LATEST_SAFE_VERSION

  return (
    <>
      <Typography variant="h4" mb={1}>
        Current version: <b>{safe.version}</b> → new version: <b>{latestSafeVersion}</b>
      </Typography>

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
