import { type Approval, type ApprovalInfosResponse, ApprovalModule } from '@/security/modules/ApprovalModule'
import { type BaseTransaction } from '@safe-global/safe-apps-sdk'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'

import { createContext, type ReactElement, type ReactNode, useState, useEffect } from 'react'

export const TransactionInsightContext = createContext<{
  approvalData: Approval[]
  // can be undefined if we sign an existing transaction
  updateTransaction: ((tx: BaseTransaction[]) => void) | undefined
  safeTransaction: SafeTransaction | undefined
}>({
  approvalData: [],
  updateTransaction: () => {},
  safeTransaction: undefined,
})

export const TransactionInsightProvider = ({
  children,
  updateTransaction,
  safeTransaction,
}: {
  children: ReactNode
  updateTransaction?: (txs: BaseTransaction[]) => void
  safeTransaction: SafeTransaction | undefined
}): ReactElement => {
  const [approvalData, setApprovalData] = useState<Approval[]>([])

  // TODO: make compatible with multiple modules
  const callback = (response: ApprovalInfosResponse) => {
    setApprovalData(response.payload)
  }

  // Todo: call module
  useEffect(() => {
    if (!safeTransaction) {
      return
    }
    const approvalModule = new ApprovalModule()
    approvalModule.scanTransactions(safeTransaction, callback)
  }, [safeTransaction])
  return (
    <TransactionInsightContext.Provider value={{ approvalData, updateTransaction, safeTransaction }}>
      {children}
    </TransactionInsightContext.Provider>
  )
}
