import { OperationType } from '@safe-global/safe-core-sdk-types'
import { getMultiSendCallOnlyDeployment } from '@safe-global/safe-deployments'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { SecuritySeverity } from '../types'
import type { SecurityModule, SecurityResponse } from '../types'

type DelegateCallModuleRequest = {
  chainId: string
  safeVersion: SafeInfo['version']
  safeTransaction: SafeTransaction
}

export type DelegateCallModuleResponse = {
  description: {
    short: string
    long: string
  }
}

export class DelegateCallModule implements SecurityModule<DelegateCallModuleRequest, DelegateCallModuleResponse> {
  private isUnexpectedDelegateCall(request: DelegateCallModuleRequest): boolean {
    const { chainId, safeTransaction, safeVersion } = request

    if (safeTransaction.data.operation !== OperationType.DelegateCall) {
      return false
    }

    // We need not check for nested delegate calls as we only use MultiSendCallOnly in the UI
    const multiSendDeployment = getMultiSendCallOnlyDeployment({ network: chainId, version: safeVersion ?? undefined })

    return multiSendDeployment?.defaultAddress !== safeTransaction.data.to
  }

  async scanTransaction(request: DelegateCallModuleRequest): Promise<SecurityResponse<DelegateCallModuleResponse>> {
    if (!this.isUnexpectedDelegateCall(request)) {
      return {
        severity: SecuritySeverity.NONE,
      }
    }

    return {
      severity: SecuritySeverity.HIGH,
      payload: {
        description: {
          short: 'Unexpected DelegateCall',
          long: 'This transaction is a DelegateCall. It calls a smart contract that will be able to modify your Safe Account.',
        },
      },
    }
  }
}
