import {
  isExecTxData,
  isExecTxInfo,
  isOnChainConfirmationTxData,
  isOnChainConfirmationTxInfo,
} from '../transaction-guards'
import { faker } from '@faker-js/faker/.'
import { Safe__factory } from '@/types/contracts'
import { TransactionInfoType, TransactionTokenType, TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'

describe('transaction-guards', () => {
  describe('isOnChainConfirmationTxData', () => {
    it('should return false for undefined', () => {
      expect(isOnChainConfirmationTxData(undefined)).toBeFalsy()
    })

    it('should return false for arbitrary txData', () => {
      expect(
        isOnChainConfirmationTxData({
          operation: 0,
          to: { value: faker.finance.ethereumAddress() },
          trustedDelegateCallTarget: false,
          addressInfoIndex: undefined,
          dataDecoded: undefined,
          hexData: faker.string.hexadecimal({ length: 64 }),
        }),
      ).toBeFalsy()
    })

    it('should return true for approveHash calls', () => {
      const safeInterface = Safe__factory.createInterface()
      expect(
        isOnChainConfirmationTxData({
          operation: 0,
          to: { value: faker.finance.ethereumAddress() },
          trustedDelegateCallTarget: false,
          addressInfoIndex: undefined,
          dataDecoded: undefined,
          hexData: safeInterface.encodeFunctionData('approveHash', [faker.string.hexadecimal({ length: 64 })]),
        }),
      ).toBeTruthy()
    })
  })

  describe('isOnChainConfirmationTxInfo', () => {
    it('should return false for non-custom tx infos', () => {
      expect(
        isOnChainConfirmationTxInfo({
          type: TransactionInfoType.TRANSFER,
          direction: TransferDirection.INCOMING,
          recipient: { value: faker.finance.ethereumAddress() },
          sender: { value: faker.finance.ethereumAddress() },
          transferInfo: {
            imitation: false,
            tokenAddress: faker.finance.ethereumAddress(),
            type: TransactionTokenType.ERC20,
            trusted: true,
            value: '100',
          },
        }),
      ).toBeFalsy()
    })

    it('should return false for approveHash custom txs with mismatching data', () => {
      expect(
        isOnChainConfirmationTxInfo({
          type: TransactionInfoType.CUSTOM,
          dataSize: '69',
          isCancellation: false,
          to: { value: faker.finance.ethereumAddress() },
          value: '0',
          methodName: 'approveHash',
        }),
      ).toBeFalsy()
    })

    it('should return true for approveHash custom txs', () => {
      expect(
        isOnChainConfirmationTxInfo({
          type: TransactionInfoType.CUSTOM,
          dataSize: '36',
          isCancellation: false,
          to: { value: faker.finance.ethereumAddress() },
          value: '0',
          methodName: 'approveHash',
        }),
      ).toBeTruthy()
    })
  })

  describe('isExecTxData', () => {
    it('should return false for undefined', () => {
      expect(isExecTxData(undefined)).toBeFalsy()
    })

    it('should return false for arbitrary txData', () => {
      expect(
        isExecTxData({
          operation: 0,
          to: { value: faker.finance.ethereumAddress() },
          trustedDelegateCallTarget: false,
          addressInfoIndex: undefined,
          dataDecoded: undefined,
          hexData: faker.string.hexadecimal({ length: 64 }),
        }),
      ).toBeFalsy()
    })
    it('should return true for execTransaction calls', () => {
      const safeInterface = Safe__factory.createInterface()
      expect(
        isExecTxData({
          operation: 0,
          to: { value: faker.finance.ethereumAddress() },
          trustedDelegateCallTarget: false,
          addressInfoIndex: undefined,
          dataDecoded: undefined,
          hexData: safeInterface.encodeFunctionData('execTransaction', [
            faker.finance.ethereumAddress(),
            '0',
            faker.string.hexadecimal({ length: 64 }),
            0,
            0,
            0,
            0,
            ZERO_ADDRESS,
            ZERO_ADDRESS,
            faker.string.hexadecimal({ length: 130 }),
          ]),
        }),
      ).toBeTruthy()
    })
  })

  describe('isExecTxInfo', () => {
    it('should return false for non-custom tx infos', () => {
      expect(
        isExecTxInfo({
          type: TransactionInfoType.TRANSFER,
          direction: TransferDirection.INCOMING,
          recipient: { value: faker.finance.ethereumAddress() },
          sender: { value: faker.finance.ethereumAddress() },
          transferInfo: {
            imitation: false,
            tokenAddress: faker.finance.ethereumAddress(),
            type: TransactionTokenType.ERC20,
            trusted: true,
            value: '100',
          },
        }),
      ).toBeFalsy()
    })

    it('should return true for execTransaction custom txs', () => {
      expect(
        isExecTxInfo({
          type: TransactionInfoType.CUSTOM,
          dataSize: '420',
          isCancellation: false,
          to: { value: faker.finance.ethereumAddress() },
          value: '0',
          methodName: 'execTransaction',
        }),
      ).toBeTruthy()
    })
  })
})
