import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type SecurityResponse, type SecurityModule, SecuritySeverity } from '../types'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { createReadOnlyEthersAdapter } from '@/hooks/coreSDK/safeCoreSDK'
import { sameAddress } from '@/utils/addresses'
import { Multi_send__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import { decodeMultiSendTxs } from '@/utils/transactions'
import { ERC20__factory } from '@/types/contracts/factories/@openzeppelin/contracts/build/contracts/ERC20__factory'
import { ERC721__factory } from '@/types/contracts/factories/@openzeppelin/contracts/build/contracts/ERC721__factory'
import { type FunctionFragment, id } from 'ethers/lib/utils'
import { type BaseTransaction } from '@safe-global/safe-apps-sdk'

export type UnknownAddressModuleResponse = Array<{
  address: string
}>

export type UnknownAddressModuleRequest = {
  safeTransaction: SafeTransaction
  provider: JsonRpcProvider
  knownAddresses: string[]
}

const isCalldata = (data: string, fragment: FunctionFragment): boolean => {
  const signature = fragment.format()
  const signatureId = id(signature).slice(0, 10)
  return data.startsWith(signatureId)
}

// ERC-20
const erc20Interface = ERC20__factory.createInterface()
const transferFragment = erc20Interface.getFunction('transfer')
const isErc20TransferCalldata = (data: string): boolean => {
  return isCalldata(data, transferFragment)
}

// ERC-721
const erc721Interface = ERC721__factory.createInterface()
const transferFromFragment = erc721Interface.getFunction('transferFrom')
const isErc721TransferFromCalldata = (data: string): boolean => {
  return isCalldata(data, transferFromFragment)
}

const safeTransferFromFragment = erc721Interface.getFunction('safeTransferFrom(address,address,uint256)')
const isErc721SafeTransferFromCalldata = (data: string): boolean => {
  return isCalldata(data, safeTransferFromFragment)
}

const safeTransferFromWithBytesFragment = erc721Interface.getFunction('safeTransferFrom(address,address,uint256,bytes)')
const isErc721SafeTransferFromWithBytesCalldata = (data: string): boolean => {
  return isCalldata(data, safeTransferFromFragment)
}

// MultiSend
const multiSendInterface = Multi_send__factory.createInterface()
const multiSendFragment = multiSendInterface.getFunction('multiSend')
const isMultiSendCalldata = (data: string): boolean => {
  return isCalldata(data, multiSendFragment)
}

const getTransactionRecipients = ({ data, to }: BaseTransaction): UnknownAddressModuleResponse => {
  // ERC-20
  if (isErc20TransferCalldata(data)) {
    const [to] = erc20Interface.decodeFunctionData(transferFragment, data)
    return [{ address: to }]
  }

  // ERC-721
  if (isErc721TransferFromCalldata(data)) {
    const [, to] = erc721Interface.decodeFunctionData(transferFromFragment, data)
    return [{ address: to }]
  }

  if (isErc721SafeTransferFromCalldata(data)) {
    const [, to] = erc721Interface.decodeFunctionData(safeTransferFromFragment, data)
    return [{ address: to }]
  }

  if (isErc721SafeTransferFromWithBytesCalldata(data)) {
    const [, to] = erc721Interface.decodeFunctionData(safeTransferFromWithBytesFragment, data)
    return [{ address: to }]
  }

  // MultiSend
  if (isMultiSendCalldata(data)) {
    return decodeMultiSendTxs(data).flatMap(getTransactionRecipients)
  }

  // Native transfer
  return [{ address: to }]
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

    const ethAdapter = createReadOnlyEthersAdapter(provider)
    const isSmartContract = await ethAdapter.isContractDeployed(recipient)
    return isSmartContract
  }

  async scanTransaction(request: UnknownAddressModuleRequest): Promise<SecurityResponse<UnknownAddressModuleResponse>> {
    const { safeTransaction, provider, knownAddresses } = request

    const recipients = getTransactionRecipients(safeTransaction.data)

    const unknownRecipients = (
      await Promise.all(
        recipients.map(async (recipient) => {
          const isKnown = await this.isKnownRecipient(provider, knownAddresses, recipient.address)
          return isKnown ? null : recipient
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
