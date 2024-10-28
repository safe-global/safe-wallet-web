import { isOnChainConfirmationTxData, isOnChainConfirmationTxInfo } from '../transaction-guards'
import { faker } from '@faker-js/faker/.'
import { Safe__factory } from '@/types/contracts'
import { TransactionInfoType, TransactionTokenType, TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'

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
})
