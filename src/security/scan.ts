import { REDEFINE_API_KEY } from '@/config/constants'
import { type JsonRpcProvider } from '@ethersproject/providers'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generateTypedData } from '@safe-global/safe-core-sdk-utils'
import type {
  ScanRequest,
  ScanResponse,
  ScanRequestContext,
  TransactionScanner,
  TransactionSecurityRule,
  TransactionSecurityWarning,
} from './types'

export const RuleBasedTransactionScanner = (ruleSet: TransactionSecurityRule[]): TransactionScanner => ({
  scanTransaction: async (scanRequest: ScanRequest, provider: JsonRpcProvider): Promise<ScanResponse> => {
    const { transaction, chainId, safeAddress, walletAddress } = scanRequest

    const context: ScanRequestContext = {
      chainId,
      safeAddress,
      provider,
      walletAddress,
    }

    const ruleFilter = await Promise.all(ruleSet.map((rule) => rule.evaluate(transaction, context)))

    return {
      triggeredWarnings: ruleSet.filter((_, idx) => ruleFilter[idx]),
    }
  },
})

type RedefinePayload = {
  chainId: number
  domain: string
  payload: {
    method: 'eth_signTypedData_v4'
    params: [string, string]
  }
}

type RedefineSeverity = {
  code: number
  label: 'CRITICAL' | 'LOW' | 'NO_ISSUES'
}

type RedefineResponse = {
  data: {
    insights: {
      issues: {
        description: {
          short: string
          long: string
        }
        severity: RedefineSeverity
        category: string
      }[]
      verdict: RedefineSeverity
    }
  }
}

const mapSeverity = (severity: RedefineSeverity): TransactionSecurityWarning['severity'] => {
  switch (severity.code) {
    case 0:
      return 'NONE'
    case 1:
      return 'LOW'
    case 2:
      return 'MEDIUM'
    case 3:
      return 'HIGH'
    case 4:
      return 'CRITICAL'
    default:
      return 'NONE'
  }
}

const REDEFINE_URL = 'https://api.redefine.net/v2/risk-analysis/messages'

export const RedefineTransactionScanner: TransactionScanner = {
  scanTransaction: async (scanRequest: ScanRequest, provider: JsonRpcProvider): Promise<ScanResponse> => {
    const { chainId, safeAddress } = scanRequest

    const txTypedData = generateTypedData({
      safeAddress,
      safeVersion: '1.3.0',
      chainId,
      safeTransactionData: scanRequest.transaction.data,
    })

    const payload: RedefinePayload = {
      chainId: chainId,
      domain: 'http://localhost:3000',
      payload: {
        method: 'eth_signTypedData_v4',
        params: [safeAddress, JSON.stringify(txTypedData)],
      },
    }

    const requestObject: RequestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
        'X-Api-Key': REDEFINE_API_KEY,
      },
      body: JSON.stringify(payload),
    }

    const res = await fetch(REDEFINE_URL, requestObject)

    if (res.ok) {
      const result = (await res.json()) as RedefineResponse
      const warnings = result.data.insights.issues?.map((issue): TransactionSecurityWarning => {
        return {
          advice: '',
          description: issue.description.short,
          id: issue.category,
          severity: mapSeverity(issue.severity),
        }
      })

      return { triggeredWarnings: warnings }
    }

    return { triggeredWarnings: [] }
  },
}

export const scanUsingRedefine = async (transaction: SafeTransaction, context: ScanRequestContext) => {}
