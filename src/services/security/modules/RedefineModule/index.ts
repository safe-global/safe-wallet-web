import { REDEFINE_API_KEY } from '@/config/constants'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generateTypedData } from '@safe-global/safe-core-sdk-utils'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '..'

const REDEFINE_URL = 'https://api.redefine.net/v2/risk-analysis/messages'

export type RedefineModuleRequest = {
  chainId: number
  safeAddress: string
  walletAddress: string
  safeTransaction: SafeTransaction
  threshold: number
}

export type RedefinedModuleResponse = RedefineResponse['data']['insights']

type RedefinePayload = {
  chainId: number
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

export class RedefineModule implements SecurityModule<RedefineModuleRequest, RedefinedModuleResponse> {
  async scanTransaction(
    request: RedefineModuleRequest,
    callback: (res: SecurityResponse<RedefinedModuleResponse>) => void,
  ) {
    const { chainId, safeAddress } = request

    const txTypedData = generateTypedData({
      safeAddress,
      safeVersion: '1.3.0', // TODO: pass to module, taking into account that lower Safe versions don't have chainId in payload
      chainId,
      safeTransactionData: request.safeTransaction.data,
    })

    const payload: RedefinePayload = {
      chainId,
      payload: {
        method: 'eth_signTypedData_v4',
        params: [safeAddress, JSON.stringify(txTypedData)],
      },
    }

    const res = await fetch(REDEFINE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
        'X-Api-Key': REDEFINE_API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error('Redefine scan failed', await res.json())
    }

    const result = (await res.json()) as RedefineResponse

    callback({
      severity: SecuritySeverity.LOW,
      payload: result.data.insights,
    })
  }
}
