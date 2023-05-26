import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { RedefineBalanceChanges } from '../redefine/RedefineBalanceChange'
import { TransactionSecurityProvider } from '../TransactionSecurityContext'
import { RedefineScanResult } from '../redefine/RedefineScanResult/RedefineScanResult'
import { Paper } from '@mui/material'

/**
 * This component is just for demo purposes.
 */
export const DemoSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  return (
    <TransactionSecurityProvider safeTx={safeTx}>
      <>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <RedefineBalanceChanges />
        </Paper>
        <RedefineScanResult />
      </>
    </TransactionSecurityProvider>
  )
}
