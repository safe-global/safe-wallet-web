import { REDEFINE_API_KEY } from '@/config/constants'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generateTypedData } from '@safe-global/safe-core-sdk-utils'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'

const REDEFINE_URL = 'https://api.redefine.net/v2/risk-analysis/messages'

export type RedefineModuleRequest = {
  chainId: number
  safeAddress: string
  walletAddress: string
  safeTransaction: SafeTransaction
  threshold: number
}

export type RedefinedModuleResponse = {
  insights: RedefineResponse['data']['insights']
  balanceChange: RedefineResponse['data']['balanceChange']
}

type RedefinePayload = {
  chainId: number
  payload: {
    method: 'eth_signTypedData_v4'
    params: [string, string]
  }
}

type RedefineSeverity = {
  code: number
  label: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_ISSUES'
}

type RedefineBalanceChange =
  | {
      address: string
      amount: {
        value: string
        normalizedValue: string
      }
      type: 'ERC20'
      symbol: string
      decimals: number
      name: string
    }
  | {
      amount: {
        value: string
        normalizedValue: string
      }
      type: 'NATIVE'
      symbol: string
      decimals: number
      name: string
    }

type RedefineResponse = {
  data: {
    balanceChange?: {
      in: RedefineBalanceChange[]
      out: RedefineBalanceChange[]
    }
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

export const mapSeverity = ({ label }: RedefineSeverity): SecuritySeverity => {
  if (label === 'CRITICAL') {
    return SecuritySeverity.CRITICAL
  }

  if (label === 'HIGH') {
    return SecuritySeverity.HIGH
  }

  if (label === 'MEDIUM') {
    return SecuritySeverity.MEDIUM
  }

  if (label === 'LOW') {
    return SecuritySeverity.LOW
  }

  return SecuritySeverity.NONE
}

export class RedefineModule implements SecurityModule<RedefineModuleRequest, RedefinedModuleResponse> {
  async scanTransaction(request: RedefineModuleRequest): Promise<SecurityResponse<RedefinedModuleResponse>> {
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

    return {
      severity: mapSeverity(result.data.insights.verdict),
      payload: {
        insights: result.data.insights,
        balanceChange: result.data.balanceChange,
      },
    }
  }
}
