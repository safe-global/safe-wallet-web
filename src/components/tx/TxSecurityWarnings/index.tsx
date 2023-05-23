import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { SecurityWarning, SecurityHint } from '../SecurityWarnings'
import CircularProgress from '@mui/material/CircularProgress'
import { BalanceChanges } from '../BalanceChange'
import { useRedefine } from './useRedefine'
import { useRecipientModule } from './useRecipientModule'
import { shortenAddress } from '@/utils/formatters'

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  const [redefineScanResult, , redefineLoading] = useRedefine(safeTx)
  const [recipientScanResult, , recipientLoading] = useRecipientModule(safeTx)

  return (
    <>
      {redefineLoading && !redefineScanResult ? (
        <CircularProgress />
      ) : (
        redefineScanResult && (
          <>
            <BalanceChanges balanceChange={redefineScanResult.payload?.balanceChange} />
            {redefineScanResult.payload?.issues?.map((issue) => (
              <SecurityHint key={issue.category} severity={issue.severity} text={issue.description.short} />
            ))}
            <SecurityWarning severity={redefineScanResult.severity} />
          </>
        )
      )}
      {recipientLoading ? (
        <CircularProgress />
      ) : (
        recipientScanResult && (
          <>
            {recipientScanResult.payload?.map((warning) => (
              <SecurityHint
                key={warning.address}
                severity={warning.severity}
                text={`${warning.description.short} (${shortenAddress(warning.address)})`}
              />
            ))}
            <SecurityWarning severity={recipientScanResult.severity} />
          </>
        )
      )}
    </>
  )
}
