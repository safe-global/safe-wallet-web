import type { JsonRpcProvider } from '@ethersproject/providers'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import { isSmartContract } from '@/hooks/wallets/web3'
import { SecuritySeverity } from '../types'
import { getTransactionRecipients } from '../../transactions'
import type { SecurityModule, SecurityResponse } from '../types'

export type UnusedAddressModuleRequest = {
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
}

export type UnusedAddressModuleResponse = Array<{ address: string }>

export class UnusedAddressModule implements SecurityModule<UnusedAddressModuleRequest, UnusedAddressModuleResponse> {
  private async isUnused(provider: JsonRpcProvider, address: string): Promise<boolean> {
    const [hasCode, balance] = await Promise.all([isSmartContract(provider, address), provider.getBalance(address)])
    return !hasCode && balance.eq(0)
  }

  async scanTransaction(request: UnusedAddressModuleRequest): Promise<SecurityResponse<UnusedAddressModuleResponse>> {
    const { safeTransaction, provider } = request

    const recipients = Array.from(new Set(getTransactionRecipients(safeTransaction.data)))

    const unusedAddresses = (
      await Promise.all(
        recipients.map(async (recipient) => {
          const isUnused = await this.isUnused(provider, recipient)
          return isUnused ? { address: recipient } : null
        }),
      )
    ).filter((recipient): recipient is UnusedAddressModuleResponse[number] => recipient !== null)

    if (unusedAddresses.length > 0) {
      return {
        severity: SecuritySeverity.HIGH,
        payload: unusedAddresses,
      }
    }

    return {
      severity: SecuritySeverity.NONE,
    }
  }
}
