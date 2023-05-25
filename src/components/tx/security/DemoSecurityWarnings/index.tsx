import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { BalanceChanges } from '../redefine/RedefineBalanceChange'
import { TransactionSecurityProvider } from '../TransactionSecurityContext'
import { RedefineScanResult } from '../redefine/RedefineScanResult/RedefineScanResult'

/**
 * This component is just for demo purposes.
 */
export const DemoSecurityWarnings = ({ safeTx }: { safeTx: SafeTransaction | undefined }) => {
  return (
    <TransactionSecurityProvider safeTx={safeTx}>
      <>
        <BalanceChanges />
        <RedefineScanResult />
      </>
    </TransactionSecurityProvider>
  )
}
