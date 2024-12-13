import { REDEFINE_API } from '@/config/constants'
import { isEIP712TypedData } from '@/utils/safe-messages'
import { normalizeTypedData } from '@/utils/web3'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { generateTypedData } from '@safe-global/protocol-kit/dist/src/utils/eip-712'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'

export const enum REDEFINE_ERROR_CODES {
  ANALYSIS_IN_PROGRESS = 1000,
  SIMULATION_FAILED = 1001,
  INPUT_VALIDATION = 2000,
  BAD_REQUEST = 3000,
}

const redefineSeverityMap: Record<RedefineSeverity['label'], SecuritySeverity> = {
  CRITICAL: SecuritySeverity.CRITICAL,
  HIGH: SecuritySeverity.HIGH,
  MEDIUM: SecuritySeverity.MEDIUM,
  LOW: SecuritySeverity.LOW,
  NO_ISSUES: SecuritySeverity.NONE,
}

export type RedefineModuleRequest = {
  chainId: number
  safeAddress: string
  walletAddress: string
  data: SafeTransaction | EIP712TypedData
  threshold: number
}

export type RedefineModuleResponse = {
  issues?: Array<
    Omit<NonNullable<RedefineResponse['data']>['insights']['issues'][number], 'severity'> & {
      severity: SecuritySeverity
    }
  >
  balanceChange?: NonNullable<RedefineResponse['data']>['balanceChange']
  simulation?: NonNullable<RedefineResponse['data']>['simulation']
  errors: RedefineResponse['errors']
}

type RedefinePayload = {
  chainId: number
  domain?: string
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
  | { type: 'ERC721'; address: string; tokenId: string; name?: string; symbol?: string }

export type RedefineResponse = {
  data?: {
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
    simulation: {
      uuid: string
      time: string
      block: string
    }
  }
  errors: {
    code: number
    message: string
    extendedInfo?: Record<string, unknown>
  }[]
}

export class RedefineModule implements SecurityModule<RedefineModuleRequest, RedefineModuleResponse> {
  static prepareMessage(request: RedefineModuleRequest): string {
    const { data, safeAddress, chainId } = request
    if (isEIP712TypedData(data)) {
      const normalizedMsg = normalizeTypedData(data)
      return JSON.stringify(normalizedMsg)
    } else {
      return JSON.stringify(
        generateTypedData({
          safeAddress,
          safeVersion: '1.3.0', // TODO: pass to module, taking into account that lower Safe versions don't have chainId in payload
          chainId: BigInt(chainId),
          // TODO: find out why these types are incompaitble
          data: {
            ...data.data,
            safeTxGas: data.data.safeTxGas,
            baseGas: data.data.baseGas,
            gasPrice: data.data.gasPrice,
          },
        }),
      )
    }
  }
  async scanTransaction(request: RedefineModuleRequest): Promise<SecurityResponse<RedefineModuleResponse>> {
    if (!REDEFINE_API) {
      throw new Error('Redefine API URL is not set')
    }

    const { chainId, safeAddress, data } = request

    const message = RedefineModule.prepareMessage(request)

    const payload: RedefinePayload = {
      chainId,
      payload: {
        method: 'eth_signTypedData_v4',
        params: [safeAddress, message],
      },
    }

    const res = await fetch(REDEFINE_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/JSON',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error('Redefine scan failed', await res.json())
    }

    const result = (await res.json()) as RedefineResponse

    return {
      severity: result.data ? redefineSeverityMap[result.data.insights.verdict.label] : SecuritySeverity.NONE,
      payload: {
        issues: result.data?.insights.issues.map((issue) => ({
          ...issue,
          severity: redefineSeverityMap[issue.severity.label],
        })),
        balanceChange: result.data?.balanceChange,
        simulation: isEIP712TypedData(data) ? undefined : result.data?.simulation,
        errors: result.errors,
      },
    }
  }
}
