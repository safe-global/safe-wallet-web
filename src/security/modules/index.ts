import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type ApprovalInfosResponse } from './ApprovalModule'

export type TransactionInsightModuleResponse = ApprovalInfosResponse

export interface TransactionInsightModule {
  scanTransactions(safeTx: SafeTransaction, callback: (response: TransactionInsightModuleResponse) => void): void
}
