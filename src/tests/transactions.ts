import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { solidityPacked, concat } from 'ethers'
import { OperationType, type SafeSignature } from '@safe-global/safe-core-sdk-types'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import { ERC20__factory, ERC721__factory, Multi_send__factory } from '@/types/contracts'

export const getMockErc20TransferCalldata = (to: string) => {
  const erc20Interface = ERC20__factory.createInterface()
  return erc20Interface.encodeFunctionData('transfer', [
    to,
    0, // value
  ])
}

export const getMockErc721TransferFromCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('transferFrom', [
    ZERO_ADDRESS, // from
    to,
    0, // value
  ])
}

export const getMockErc721SafeTransferFromCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [
    ZERO_ADDRESS, // from
    to,
    0, // value
  ])
}

export const getMockErc721SafeTransferFromWithBytesCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('safeTransferFrom(address,address,uint256,bytes)', [
    ZERO_ADDRESS, // from
    to,
    0, // value
    '0x', // bytes
  ])
}

export const getMockMultiSendCalldata = (recipients: Array<string>): string => {
  // MultiSendCallOnly
  const OPERATION = 0

  const data = '0x'

  const internalTransactions = recipients.map((recipient) => {
    return solidityPacked(
      ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
      [
        OPERATION,
        recipient,
        0, // value
        data.length, // dataLength
        data, // data
      ],
    )
  })

  const multiSendInterface = Multi_send__factory.createInterface()
  return multiSendInterface.encodeFunctionData('multiSend', [concat(internalTransactions)])
}

// TODO: Replace with safeTxBuilder
export const createMockSafeTransaction = ({
  to,
  data,
  operation = OperationType.Call,
}: {
  to: string
  data: string
  operation?: OperationType
}): SafeTransaction => {
  const signatures = new Map<string, SafeSignature>([])

  return {
    data: {
      to,
      data,
      baseGas: '0',
      gasPrice: '0',
      gasToken: ZERO_ADDRESS,
      nonce: 1,
      operation,
      refundReceiver: ZERO_ADDRESS,
      safeTxGas: '0',
      value: '0x0',
    },
    signatures,
    addSignature: (sig: SafeSignature) => {
      signatures.set(sig.signer, sig)
    },
    encodedSignatures: () => {
      return '0x'
    },
    getSignature: (signer: string) => signatures.get(signer),
  }
}
