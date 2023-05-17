import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { isSmartContract } from '@/hooks/wallets/web3'
import { sameAddress } from '@/utils/addresses'
import { getTransactionRecipients } from '../../transactions'

export type UnknownAddressModuleResponse = Array<{
  address: string
}>

export type UnknownAddressModuleRequest = {
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
  knownAddresses: string[]
}

export class UnknownAddressModule implements SecurityModule<UnknownAddressModuleRequest, UnknownAddressModuleResponse> {
  private async isKnownRecipient(
    provider: JsonRpcProvider,
    knownAddresses: string[],
    recipient: string,
  ): Promise<boolean> {
    const isKnownAddress = knownAddresses.some((entry) => sameAddress(entry, recipient))

    if (isKnownAddress) {
      return true
    }

    return isSmartContract(provider, recipient)
  }

  async scanTransaction(request: UnknownAddressModuleRequest): Promise<SecurityResponse<UnknownAddressModuleResponse>> {
    const { safeTransaction, provider, knownAddresses } = request

    const recipients = Array.from(new Set(getTransactionRecipients(safeTransaction.data)))

    const unknownRecipients = (
      await Promise.all(
        recipients.map(async (recipient) => {
          const isKnown = await this.isKnownRecipient(provider, knownAddresses, recipient)
          return isKnown ? null : { address: recipient }
        }),
      )
    ).filter((recipient): recipient is UnknownAddressModuleResponse[number] => recipient !== null)

    if (unknownRecipients.length > 0) {
      return {
        severity: SecuritySeverity.LOW,
        payload: unknownRecipients,
      }
    }

    return {
      severity: SecuritySeverity.NONE,
    }
  }
}
