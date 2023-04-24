import { createReadOnlyEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { sameAddress } from '@/utils/addresses'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { getMultiSendCallOnlyContractDeployment } from '@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts'
import type { TransactionSecurityRule, ScanRequestContext } from './types'

export const TransferToUnusedAddress: TransactionSecurityRule = {
  severity: 'MEDIUM',
  description: 'You are sending funds to an address without funds, which is not a smart contract',
  id: 'UNUSED_ADDRESS',
  advice: 'Please double check that this address is used on this chain',
  evaluate: async function (transaction: SafeTransaction, context: ScanRequestContext): Promise<boolean> {
    const ethAdapter = createReadOnlyEthersAdapter(context.provider)
    const balance = await ethAdapter.getBalance(transaction.data.to)
    const isSmartContract = await ethAdapter.isContractDeployed(transaction.data.to)
    return balance.isZero() && !isSmartContract
  },
}

export const UnexpectedDelegateCall: TransactionSecurityRule = {
  severity: 'MEDIUM',
  description: 'This transaction calls a smart contract that will be able to modify your Safe.',
  id: 'UNEXPECTED_DELEGATE_CALL',
  advice: 'You should double check the transaction details',
  evaluate: async function (transaction: SafeTransaction, context: ScanRequestContext): Promise<boolean> {
    const multiSendContractAddress = getMultiSendCallOnlyContractDeployment('1.3.0', context.chainId)?.defaultAddress
    return transaction.data.operation === 1 && transaction.data.to !== multiSendContractAddress
  },
}

export const ReceiverNotInAddressbook = (addressBookEntries: string[]): TransactionSecurityRule => ({
  severity: 'LOW',
  description: 'You are sending funds to an address which is not in your address book.',
  id: 'RECEIVER_NOT_IN_AB',
  advice: 'Check the receiver address and add it to the address book.',
  evaluate: async function (transaction: SafeTransaction, context: ScanRequestContext): Promise<boolean> {
    const ethAdapter = createReadOnlyEthersAdapter(context.provider)
    const isSmartContract = await ethAdapter.isContractDeployed(transaction.data.to)
    const isInAddressBook = addressBookEntries.some((entry) => sameAddress(entry, transaction.data.to))
    return !isInAddressBook && !isSmartContract
  },
})
