import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { createReadOnlyEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { sameAddress } from '@/utils/addresses'

export type UnknownAddressModuleResponse = Array<{
  type: 'ERC20' | 'NATIVE'
  receiver: string
  token: null | string
}>

export type UnknownAddressModuleRequest = {
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
  knownAddresses: string[]
}

export class UnknownAddressModule implements SecurityModule<UnknownAddressModuleRequest, UnknownAddressModuleResponse> {
  async scanTransaction(
    request: UnknownAddressModuleRequest,
    callback: (response: SecurityResponse<UnknownAddressModuleResponse>) => void,
  ): Promise<void> {
    const { safeTransaction, provider, knownAddresses } = request
    const ethAdapter = createReadOnlyEthersAdapter(provider)
    const isSmartContract = await ethAdapter.isContractDeployed(safeTransaction.data.to)
    const isKnownAddress = knownAddresses.some((entry) => sameAddress(entry, safeTransaction.data.to))
    const nonZeroValue = safeTransaction.data.value !== '0'

    if (!isKnownAddress && !isSmartContract && nonZeroValue) {
      callback({
        severity: SecuritySeverity.LOW,
        payload: [
          {
            receiver: safeTransaction.data.to,
            token: null,
            type: 'NATIVE',
          },
        ],
      })
    }
  }
}
