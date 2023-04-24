import { REDEFINE_API_KEY } from '@/config/constants'
import { Gnosis_safe__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import { type JsonRpcProvider } from '@ethersproject/providers'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
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
    method: 'eth_sendTransaction'
    params: [
      {
        from: string
        to: string
        data: string
        value: string
      },
    ]
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

export const RedefineTransactionScanner: TransactionScanner = {
  scanTransaction: async (scanRequest: ScanRequest, provider: JsonRpcProvider): Promise<ScanResponse> => {
    const { transaction, chainId, safeAddress, walletAddress } = scanRequest

    const context: ScanRequestContext = {
      chainId,
      safeAddress,
      provider,
      walletAddress,
    }

    // prepare payload
    const REDEFINE_URL = 'https://api.redefine.net/v2/risk-analysis/txns'

    const txData = Gnosis_safe__factory.createInterface().encodeFunctionData('execTransaction', [
      transaction.data.to,
      transaction.data.value,
      transaction.data.data,
      transaction.data.operation,
      transaction.data.safeTxGas,
      transaction.data.baseGas,
      transaction.data.gasPrice,
      transaction.data.gasToken,
      transaction.data.refundReceiver,
      transaction.encodedSignatures(),
    ])

    const payload: RedefinePayload = {
      chainId: context.chainId,
      domain: 'https://app.safe.global',
      payload: {
        method: 'eth_sendTransaction',
        params: [
          {
            from: context.walletAddress,
            data: txData,
            to: context.safeAddress,
            value: '0x0',
          },
        ],
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
