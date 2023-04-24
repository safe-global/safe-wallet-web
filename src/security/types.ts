import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type JsonRpcProvider } from '@ethersproject/providers'

type Severity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface TransactionSecurityWarning {
  severity: Severity
  description: string
  id: string
  advice: string
}

export type TransactionSecurityRule = TransactionSecurityWarning & {
  evaluate(transaction: SafeTransaction, context: ScanRequestContext): Promise<boolean>
}

export type ScanRequest = {
  chainId: number
  safeAddress: string
  walletAddress: string
  transaction: SafeTransaction
}

export type ScanResponse = {
  triggeredWarnings: TransactionSecurityWarning[]
}

export interface ScanRequestContext {
  readonly provider: JsonRpcProvider
  readonly walletAddress: string
  readonly safeAddress: string
  readonly chainId: number
}

export interface TransactionScanner {
  scanTransaction: (scanRequest: ScanRequest, provider: JsonRpcProvider) => Promise<ScanResponse>
}
