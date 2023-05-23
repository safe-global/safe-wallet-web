import * as sdk from '@safe-global/safe-gateway-typescript-sdk'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { ethers } from 'ethers'
import { hexZeroPad } from 'ethers/lib/utils'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import * as web3 from '@/hooks/wallets/web3'
import { ERC20__factory, ERC721__factory, Multi_send__factory } from '@/types/contracts'
import { RecipientAddressModule } from '.'

const getMockErc20TransferCalldata = (to: string) => {
  const erc20Interface = ERC20__factory.createInterface()
  return erc20Interface.encodeFunctionData('transfer', [
    to,
    0, // value
  ])
}

const getMockErc721TransferFromCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('transferFrom', [
    ZERO_ADDRESS, // from
    to,
    0, // value
  ])
}

const getMockErc721SafeTransferFromCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [
    ZERO_ADDRESS, // from
    to,
    0, // value
  ])
}

const getMockErc721SafeTransferFromWithBytesCalldata = (to: string) => {
  const erc721Interface = ERC721__factory.createInterface()
  return erc721Interface.encodeFunctionData('safeTransferFrom(address,address,uint256,bytes)', [
    ZERO_ADDRESS, // from
    to,
    0, // value
    '0x', // bytes
  ])
}

const getMockMultiSendCalldata = (recipients: Array<string>): string => {
  // MultiSendCallOnly
  const OPERATION = 0

  const data = '0x'

  const internalTransactions = recipients.map((recipient) => {
    return ethers.utils.solidityPack(
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
  return multiSendInterface.encodeFunctionData('multiSend', [ethers.utils.concat(internalTransactions)])
}

const createSafeTransaction = ({
  to,
  data,
  operation = OperationType.Call,
}: {
  to: string
  data: string
  operation?: OperationType
}): SafeTransaction => {
  return {
    data: {
      to,
      data,
      baseGas: 0,
      gasPrice: 0,
      gasToken: ZERO_ADDRESS,
      nonce: 1,
      operation,
      refundReceiver: ZERO_ADDRESS,
      safeTxGas: 0,
      value: '0x0',
    },
    signatures: new Map(),
    addSignature: () => {
      throw new Error('Function not implemented.')
    },
    encodedSignatures: () => {
      throw new Error('Function not implemented.')
    },
  }
}

describe('RecipientAddressModule', () => {
  const isSmartContractSpy = jest.spyOn(web3, 'isSmartContract')

  const mockGetBalance = jest.fn()
  const mockProvider = {
    getBalance: mockGetBalance,
  } as unknown as JsonRpcProvider

  const mockGetSafeInfo = jest.spyOn(sdk, 'getSafeInfo')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const RecipientAddressModuleInstance = new RecipientAddressModule()

  it('should not warn if the address(es) is/are known', async () => {
    isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
    mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(1)))
    mockGetSafeInfo.mockImplementation(() => Promise.reject('Safe not found'))

    const recipient = hexZeroPad('0x1', 20)

    const safeTransaction = createSafeTransaction({
      to: recipient,
      data: '0x',
    })

    const result = await RecipientAddressModuleInstance.scanTransaction({
      safeTransaction,
      provider: mockProvider,
      chainId: '1',
      knownAddresses: [recipient],
    })

    expect(result).toEqual({
      severity: 0,
      payload: [],
    })

    // Don't check further if the recipient is known
    expect(isSmartContractSpy).not.toHaveBeenCalled()
  })

  describe('it should warn if the address(es) is/are not known', () => {
    beforeEach(() => {
      isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
      mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(1)))
      mockGetSafeInfo.mockImplementation(() => Promise.reject('Safe not found'))
    })

    // ERC-20
    it('should warn about recipient of ERC-20 transfer recipients', async () => {
      const erc20 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc20TransferCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc20,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })

    // ERC-721
    it('should warn about recipient of ERC-721 transferFrom recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721TransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256,bytes) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromWithBytesCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })

    // multiSend
    it('should warn about recipient(s) of multiSend recipients', async () => {
      const multiSend = hexZeroPad('0x1', 20)

      const recipient1 = hexZeroPad('0x2', 20)
      const recipient2 = hexZeroPad('0x3', 20)

      const data = getMockMultiSendCalldata([recipient1, recipient2])

      const safeTransaction = createSafeTransaction({
        to: multiSend,
        data,
        operation: OperationType.DelegateCall,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(2)
      expect(mockGetBalance).toHaveBeenCalledTimes(2)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient1,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient2,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })

    // Other
    it('should warn about recipient of native transfer recipients', async () => {
      const recipient = hexZeroPad('0x1', 20)

      const safeTransaction = createSafeTransaction({
        to: recipient,
        data: '0x',
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
        ],
      })
    })
  })

  it('should not warn if the address(es) is/are used', async () => {
    isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
    mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(1)))
    mockGetSafeInfo.mockImplementation(() => Promise.reject('Safe not found'))

    const recipient = hexZeroPad('0x1', 20)

    const safeTransaction = createSafeTransaction({
      to: recipient,
      data: '0x',
    })

    const result = await RecipientAddressModuleInstance.scanTransaction({
      safeTransaction,
      provider: mockProvider,
      chainId: '1',
      knownAddresses: [],
    })

    expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
    expect(mockGetBalance).toHaveBeenCalledTimes(1)
    // Don't check as on mainnet
    expect(mockGetSafeInfo).not.toHaveBeenCalled()

    expect(result).toEqual({
      severity: 1,
      payload: [
        {
          severity: 1,
          address: recipient,
          description: {
            short: 'Address not in address book',
            long: 'The address is not in your address book and is not a smart contract',
          },
          type: 'UNKNOWN_ADDRESS',
        },
      ],
    })
  })

  describe('it should warn if the address(es) is/are unused', () => {
    beforeEach(() => {
      isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
      mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(0)))
      mockGetSafeInfo.mockImplementation(() => Promise.reject('Safe not found'))
    })

    // ERC-20
    it('should warn about recipient of ERC-20 transfer recipients', async () => {
      const erc20 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc20TransferCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc20,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })

    // ERC-721
    it('should warn about recipient of ERC-721 transferFrom recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721TransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256,bytes) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromWithBytesCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })

    // multiSend
    it('should warn about recipient(s) of multiSend recipients', async () => {
      const multiSend = hexZeroPad('0x1', 20)

      const recipient1 = hexZeroPad('0x2', 20)
      const recipient2 = hexZeroPad('0x3', 20)

      const data = getMockMultiSendCalldata([recipient1, recipient2])

      const safeTransaction = createSafeTransaction({
        to: multiSend,
        data,
        operation: OperationType.DelegateCall,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(2)
      expect(mockGetBalance).toHaveBeenCalledTimes(2)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient1,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient1,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
          {
            severity: 1,
            address: recipient2,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient2,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })

    // Other
    it('should warn about recipient of native transfer recipients', async () => {
      const recipient = hexZeroPad('0x1', 20)

      const safeTransaction = createSafeTransaction({
        to: recipient,
        data: '0x',
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '1',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      // Don't check as on mainnet
      expect(mockGetSafeInfo).not.toHaveBeenCalled()

      expect(result).toEqual({
        severity: 1,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address seems to be unused',
              long: 'The address has no native token balance and is not a smart contract',
            },
            type: 'UNUSED_ADDRESS',
          },
        ],
      })
    })
  })

  it('should not warn if the address(s) is/are Safe(s) deployed on the current network', async () => {
    isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
    mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(1)))
    mockGetSafeInfo.mockImplementation(() => Promise.resolve({} as SafeInfo))

    const recipient = hexZeroPad('0x1', 20)

    const safeTransaction = createSafeTransaction({
      to: recipient,
      data: '0x',
    })

    const result = await RecipientAddressModuleInstance.scanTransaction({
      safeTransaction,
      provider: mockProvider,
      chainId: '1',
      knownAddresses: [],
    })

    expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
    expect(mockGetBalance).toHaveBeenCalledTimes(1)
    // Don't check as on mainnet
    expect(mockGetSafeInfo).not.toHaveBeenCalled()

    expect(result).toEqual({
      severity: 1,
      payload: [
        {
          severity: 1,
          address: recipient,
          description: {
            short: 'Address not in address book',
            long: 'The address is not in your address book and is not a smart contract',
          },
          type: 'UNKNOWN_ADDRESS',
        },
      ],
    })
  })

  describe('it should warn if the address(es) is/are Safe(s) deployed on mainnet but not the current network', () => {
    beforeEach(() => {
      isSmartContractSpy.mockImplementation(() => Promise.resolve(false))
      mockGetBalance.mockImplementation(() => Promise.resolve(ethers.BigNumber.from(1)))
      mockGetSafeInfo.mockImplementation(() => Promise.resolve({} as SafeInfo))
    })

    // ERC-20
    it('should warn about recipient of ERC-20 transfer recipients', async () => {
      const erc20 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc20TransferCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc20,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })

    // ERC-721
    it('should warn about recipient of ERC-721 transferFrom recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721TransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })

    it('should warn about recipient of ERC-721 safeTransferFrom(address,address,uint256,bytes) recipients', async () => {
      const erc721 = hexZeroPad('0x1', 20)

      const recipient = hexZeroPad('0x2', 20)
      const data = getMockErc721SafeTransferFromWithBytesCalldata(recipient)

      const safeTransaction = createSafeTransaction({
        to: erc721,
        data,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })

    // multiSend
    it('should warn about recipient(s) of multiSend recipients', async () => {
      const multiSend = hexZeroPad('0x1', 20)

      const recipient1 = hexZeroPad('0x2', 20)
      const recipient2 = hexZeroPad('0x3', 20)

      const data = getMockMultiSendCalldata([recipient1, recipient2])

      const safeTransaction = createSafeTransaction({
        to: multiSend,
        data,
        operation: OperationType.DelegateCall,
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(2)
      expect(mockGetBalance).toHaveBeenCalledTimes(2)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(2)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient1,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient1,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
          {
            severity: 1,
            address: recipient2,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient2,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })

    // Other
    it('should warn about recipient of native transfer recipients', async () => {
      const recipient = hexZeroPad('0x1', 20)

      const safeTransaction = createSafeTransaction({
        to: recipient,
        data: '0x',
      })

      const result = await RecipientAddressModuleInstance.scanTransaction({
        safeTransaction,
        provider: mockProvider,
        chainId: '5',
        knownAddresses: [],
      })

      expect(isSmartContractSpy).toHaveBeenCalledTimes(1)
      expect(mockGetBalance).toHaveBeenCalledTimes(1)
      expect(mockGetSafeInfo).toHaveBeenCalledTimes(1)

      expect(result).toEqual({
        severity: 3,
        payload: [
          {
            severity: 1,
            address: recipient,
            description: {
              short: 'Address not in address book',
              long: 'The address is not in your address book and is not a smart contract',
            },
            type: 'UNKNOWN_ADDRESS',
          },
          {
            severity: 3,
            address: recipient,
            description: {
              short: 'Target Safe not deployed on current network',
              long: 'The address is a Safe on mainnet, but it is not deployed on the current network',
            },
            type: 'SAFE_ON_WRONG_CHAIN',
          },
        ],
      })
    })
  })
})
