import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { SecurityWarning, SecurityHint } from '../SecurityWarnings'
import CircularProgress from '@mui/material/CircularProgress'
import { BalanceChanges } from '../BalanceChange'
import { useRedefine } from './useRedefine'

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  const [redefineScanResult, , redefineLoading] = useRedefine(safeTx)

  return (
    <>
      {redefineLoading && !redefineScanResult ? (
        <CircularProgress />
      ) : (
        redefineScanResult && (
          <>
            <BalanceChanges balanceChange={redefineScanResult.payload?.balanceChange} />
            {redefineScanResult?.payload?.issues?.map((issue) => (
              <SecurityHint key={issue.category} severity={issue.severity} text={issue.description.short} />
            ))}
            <SecurityWarning severity={redefineScanResult?.severity} />
          </>
        )
      )}
    </>
  )
}
