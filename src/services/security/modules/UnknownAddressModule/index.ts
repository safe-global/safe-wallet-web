import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { createReadOnlyEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { sameAddress } from '@/utils/addresses'

export type UnknownAddressModuleResponse = Array<{
  address: string
}>

export type UnknownAddressModuleRequest = {
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
  knownAddresses: string[]
}

export class UnknownAddressModule implements SecurityModule<UnknownAddressModuleRequest, UnknownAddressModuleResponse> {
  async scanTransaction(request: UnknownAddressModuleRequest): Promise<SecurityResponse<UnknownAddressModuleResponse>> {
    const { safeTransaction, provider, knownAddresses } = request
    const ethAdapter = createReadOnlyEthersAdapter(provider)
    const isSmartContract = await ethAdapter.isContractDeployed(safeTransaction.data.to)
    const isKnownAddress = knownAddresses.some((entry) => sameAddress(entry, safeTransaction.data.to))
    const nonZeroValue = safeTransaction.data.value !== '0'

    if (!isKnownAddress && !isSmartContract && nonZeroValue) {
      return {
        severity: SecuritySeverity.LOW,

        // TODO: Decode multiSend
        // TODO: Support ERC20 and NFT transfers
        payload: [
          {
            address: safeTransaction.data.to,
          },
        ],
      }
    }

    return {
      severity: SecuritySeverity.NONE,
    }
  }
}
