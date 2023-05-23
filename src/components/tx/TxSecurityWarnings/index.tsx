import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { mapSeverity, type RedefinedModuleResponse } from '@/services/security/modules/RedefineModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import { dispatchTxScan, SecurityModuleNames } from '@/services/security/service'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { SecurityWarning, SecurityHint } from '../SecurityWarnings'
import CircularProgress from '@mui/material/CircularProgress'
import { BalanceChanges } from '../BalanceChange'

const useRedefine = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()

  return useAsync<SecurityResponse<RedefinedModuleResponse>>(() => {
    if (!safeTransaction || !wallet?.address) {
      return
    }
    return dispatchTxScan({
      type: SecurityModuleNames.REDEFINE,
      request: {
        chainId: Number(safe.chainId),
        safeTransaction,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      },
    })
  }, [safe.chainId, safe.threshold, safeAddress, safeTransaction, wallet?.address])
}

export const TxSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  const [redefineScanResult, , redefineLoading] = useRedefine(safeTx)

  return (
    <>
      {redefineLoading ? (
        <CircularProgress />
      ) : (
        redefineScanResult && (
          <>
            <BalanceChanges balanceChange={redefineScanResult.payload?.balanceChange} />
            {redefineScanResult?.payload &&
              redefineScanResult.payload.insights.issues.map((issue) => (
                <SecurityHint
                  key={issue.category}
                  severity={mapSeverity(issue.severity)}
                  text={issue.description.short}
                />
              ))}
            <SecurityWarning severity={redefineScanResult?.severity} />
          </>
        )
      )}
    </>
  )
}
