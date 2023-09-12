import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { isSmartContract } from '@/hooks/wallets/web3'
import { sameAddress } from '@/utils/addresses'
import { getTransactionRecipients } from '@/utils/transaction-calldata'
import { SecuritySeverity } from '../types'
import type { SecurityResponse, SecurityModule } from '../types'

type RecipientAddressModuleWarning = {
  severity: SecuritySeverity
  type: RecipietAddressIssueType
  address: string
  description: {
    short: string
    long: string
  }
}

export type RecipientAddressModuleResponse = Array<RecipientAddressModuleWarning>

export type RecipientAddressModuleRequest = {
  knownAddresses: string[]
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
  chainId: string
}

export const enum RecipietAddressIssueType {
  UNKNOWN_ADDRESS = 'UNKNOWN_ADDRESS',
  UNUSED_ADDRESS = 'UNUSED_ADDRESS',
  SAFE_ON_WRONG_CHAIN = 'SAFE_ON_WRONG_CHAIN',
}

const MAINNET_CHAIN_ID = '1'

export class RecipientAddressModule
  implements SecurityModule<RecipientAddressModuleRequest, RecipientAddressModuleResponse>
{
  private isKnownAddress(knownAddresses: string[], address: string): boolean {
    return knownAddresses.some((knownAddress) => sameAddress(knownAddress, address))
  }

  private async shouldWarnOfMainnetSafe(currentChainId: string, address: string): Promise<boolean> {
    // We only check if the address is a Safe on mainnet to reduce the number of requests
    if (currentChainId === MAINNET_CHAIN_ID) {
      return false
    }

    try {
      await getSafeInfo(MAINNET_CHAIN_ID, address)
      return true
    } catch {
      return false
    }
  }

  private async checkAddress(
    chainId: string,
    knownAddresses: Array<string>,
    address: string,
    provider: JsonRpcProvider,
  ): Promise<Array<RecipientAddressModuleWarning>> {
    const warnings: Array<RecipientAddressModuleWarning> = []

    if (this.isKnownAddress(knownAddresses, address)) {
      return warnings
    }

    if (await isSmartContract(provider, address)) {
      return warnings
    }

    warnings.push({
      severity: SecuritySeverity.LOW,
      address,
      description: {
        short: 'Address is not known',
        long: 'The address is not an owner or present in your address book and is not a smart contract',
      },
      type: RecipietAddressIssueType.UNKNOWN_ADDRESS,
    })

    const [balance, shouldWarnOfMainnetSafe] = await Promise.all([
      provider.getBalance(address),
      this.shouldWarnOfMainnetSafe(chainId, address),
    ])

    if (balance.eq(0)) {
      warnings.push({
        severity: SecuritySeverity.LOW,
        address,
        description: {
          short: 'Address seems to be unused',
          long: 'The address has no native token balance and is not a smart contract',
        },
        type: RecipietAddressIssueType.UNUSED_ADDRESS,
      })
    }

    if (shouldWarnOfMainnetSafe) {
      warnings.push({
        severity: SecuritySeverity.HIGH,
        address,
        description: {
          short: 'Target Safe not deployed on current network',
          long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
        },
        type: RecipietAddressIssueType.SAFE_ON_WRONG_CHAIN,
      })
    }

    return warnings
  }

  async scanTransaction(
    request: RecipientAddressModuleRequest,
  ): Promise<SecurityResponse<RecipientAddressModuleResponse>> {
    const { safeTransaction, provider, chainId, knownAddresses } = request

    const uniqueRecipients = Array.from(new Set(getTransactionRecipients(safeTransaction.data)))

    const warnings = (
      await Promise.all(
        uniqueRecipients.map((address) => this.checkAddress(chainId, knownAddresses, address, provider)),
      )
    ).flat()

    if (warnings.length === 0) {
      return {
        severity: SecuritySeverity.NONE,
      }
    }

    const severity = Math.max(...warnings.map((warning) => warning.severity))

    return {
      severity,
      payload: warnings,
    }
  }
}
