import type {
  ConflictHeader,
  DateLabel,
  Label,
  SafeAppData,
  Transaction,
} from '@safe-global/safe-gateway-typescript-sdk'
import { TransactionInfoType, ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultiSendTxInfo } from '../transaction-guards'
import { getQueuedTransactionCount, getTxOrigin, prependSafeToL2Migration } from '../transactions'
import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { chainBuilder } from '@/tests/builders/chains'
import { safeSignatureBuilder, safeTxBuilder, safeTxDataBuilder } from '@/tests/builders/safeTx'
import {
  getMultiSendCallOnlyDeployment,
  getMultiSendDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
} from '@safe-global/safe-deployments'
import type Safe from '@safe-global/protocol-kit'
import { encodeMultiSendData } from '@safe-global/protocol-kit'
import { Multi_send__factory } from '@/types/contracts'
import { faker } from '@faker-js/faker'
import { getAndValidateSafeSDK } from '@/services/tx/tx-sender/sdk'
import { decodeMultiSendData } from '@safe-global/protocol-kit/dist/src/utils'
import { checksumAddress } from '../addresses'
import { SAFE_TO_L2_MIGRATION_ADDRESS, SAFE_TO_L2_INTERFACE } from '@/config/constants'

jest.mock('@/services/tx/tx-sender/sdk')

describe('transactions', () => {
  const mockGetAndValidateSdk = getAndValidateSafeSDK as jest.MockedFunction<typeof getAndValidateSafeSDK>

  describe('getQueuedTransactionCount', () => {
    it('should return 0 if no txPage is provided', () => {
      expect(getQueuedTransactionCount()).toBe('0')
    })

    it('should return 0 if no results exist', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('0')
    })

    it('should only return the count of transactions', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [
          { timestamp: 0, type: 'DATE_LABEL' } as DateLabel,
          { label: 'Next', type: 'LABEL' } as Label,
          { nonce: 0, type: 'CONFLICT_HEADER' } as ConflictHeader,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('0')
    })

    it('should return > n if there is a next page', () => {
      const txPage = {
        next: 'fakeNextUrl.com',
        previous: undefined,
        results: [
          { type: 'TRANSACTION', transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } } } as Transaction,
          { type: 'TRANSACTION', transaction: { executionInfo: { type: 'MULTISIG', nonce: 1 } } } as Transaction,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('> 2')
    })

    it('should only count transactions of different nonces', () => {
      const txPage = {
        next: undefined,
        previous: undefined,
        results: [
          {
            type: 'TRANSACTION',
            transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } },
          } as Transaction,
          {
            type: 'TRANSACTION',
            transaction: { executionInfo: { type: 'MULTISIG', nonce: 0 } },
          } as Transaction,
        ],
      }
      expect(getQueuedTransactionCount(txPage)).toBe('1')
    })
  })

  describe('getTxOrigin', () => {
    it('should return undefined if no app is provided', () => {
      expect(getTxOrigin()).toBe(undefined)
    })

    it('should return a stringified object with the app name and url', () => {
      const app = {
        url: 'https://test.com',
        name: 'Test name',
      } as SafeAppData

      expect(getTxOrigin(app)).toBe('{"url":"https://test.com","name":"Test name"}')
    })

    it('should limit the origin to 200 characters with preference of the URL', () => {
      const app = {
        url: 'https://test.com/' + 'a'.repeat(160),
        name: 'Test name',
      } as SafeAppData

      const result = getTxOrigin(app)

      expect(result?.length).toBe(200)

      expect(result).toBe(
        '{"url":"https://test.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","name":"Tes"}',
      )
    })

    it('should only limit the URL to 200 characters', () => {
      const app = {
        url: 'https://test.com/' + 'a'.repeat(180),
        name: 'Test name',
      } as SafeAppData

      const result = getTxOrigin(app)

      expect(result?.length).toBe(200)

      expect(result).toBe(
        '{"url":"https://test.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","name":""}',
      )
    })
  })

  describe('isMultiSendTxInfo', () => {
    it('should return true for a multisend tx', () => {
      expect(
        isMultiSendTxInfo({
          type: TransactionInfoType.CUSTOM,
          to: {
            value: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
            name: 'Gnosis Safe: MultiSendCallOnly',
            logoUri:
              'https://safe-transaction-assets.safe.global/contracts/logos/0x40A2aCCbd92BCA938b02010E17A5b8929b49130D.png',
          },
          dataSize: '1188',
          value: '0',
          methodName: 'multiSend',
          actionCount: 3,
          isCancellation: false,
        }),
      ).toBe(true)
    })

    it('should return false for non-multisend txs', () => {
      expect(
        isMultiSendTxInfo({
          type: TransactionInfoType.CUSTOM,
          to: {
            value: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
            name: 'Gnosis Safe: MultiSendCallOnly',
            logoUri:
              'https://safe-transaction-assets.safe.global/contracts/logos/0x40A2aCCbd92BCA938b02010E17A5b8929b49130D.png',
          },
          dataSize: '1188',
          value: '0',
          methodName: 'multiSend',
          //actionCount: 3, // missing actionCount
          isCancellation: false,
        }),
      ).toBe(false)

      expect(
        isMultiSendTxInfo({
          type: TransactionInfoType.CUSTOM,
          to: {
            value: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
            name: 'Gnosis Safe: MultiSendCallOnly',
            logoUri:
              'https://safe-transaction-assets.safe.global/contracts/logos/0x40A2aCCbd92BCA938b02010E17A5b8929b49130D.png',
          },
          dataSize: '1188',
          value: '0',
          methodName: 'notMultiSend', // wrong method
          actionCount: 3,
          isCancellation: false,
        }),
      ).toBe(false)

      expect(
        isMultiSendTxInfo({
          type: TransactionInfoType.SETTINGS_CHANGE, // wrong type
          dataDecoded: {
            method: 'changeThreshold',
            parameters: [
              {
                name: '_threshold',
                type: 'uint256',
                value: '2',
              },
            ],
          },
        }),
      ).toBe(false)
    })
  })

  describe('prependSafeToL2Migration', () => {
    beforeEach(() => {
      // Mock create Tx
      mockGetAndValidateSdk.mockReturnValue({
        createTransaction: ({ transactions, onlyCalls }) => {
          return Promise.resolve(
            safeTxBuilder()
              .with({
                data: safeTxDataBuilder()
                  .with({
                    to: onlyCalls
                      ? getMultiSendCallOnlyDeployment()?.defaultAddress ?? faker.finance.ethereumAddress()
                      : getMultiSendDeployment()?.defaultAddress ?? faker.finance.ethereumAddress(),
                    value: '0',
                    data: Multi_send__factory.createInterface().encodeFunctionData('multiSend', [
                      encodeMultiSendData(transactions),
                    ]),
                    nonce: 0,
                    operation: 1,
                  })
                  .build(),
              })
              .build(),
          )
        },
      } as Safe)
    })

    it('should return undefined for undefined safeTx', () => {
      expect(
        prependSafeToL2Migration(undefined, extendedSafeInfoBuilder().build(), chainBuilder().build()),
      ).resolves.toBeUndefined()
    })

    it('should throw if chain is undefined', () => {
      expect(() => prependSafeToL2Migration(undefined, extendedSafeInfoBuilder().build(), undefined)).toThrowError()
    })

    it('should not modify tx if the chain is L1', () => {
      const safeTx = safeTxBuilder()
        .with({ data: safeTxDataBuilder().with({ nonce: 0 }).build() })
        .build()

      const safeInfo = extendedSafeInfoBuilder()
        .with({ implementationVersionState: ImplementationVersionState.UNKNOWN })
        .build()

      expect(prependSafeToL2Migration(safeTx, safeInfo, chainBuilder().with({ l2: false }).build())).resolves.toEqual(
        safeTx,
      )
    })

    it('should not modify tx if the nonce is > 0', () => {
      const safeTx = safeTxBuilder()
        .with({ data: safeTxDataBuilder().with({ nonce: 1 }).build() })
        .build()

      const safeInfo = extendedSafeInfoBuilder()
        .with({ implementationVersionState: ImplementationVersionState.UNKNOWN })
        .build()

      expect(prependSafeToL2Migration(safeTx, safeInfo, chainBuilder().with({ l2: true }).build())).resolves.toEqual(
        safeTx,
      )
    })

    it('should not modify tx if implementationState is correct', () => {
      const safeTx = safeTxBuilder()
        .with({ data: safeTxDataBuilder().with({ nonce: 0 }).build() })
        .build()

      const safeInfo = extendedSafeInfoBuilder()
        .with({ implementationVersionState: ImplementationVersionState.UP_TO_DATE })
        .build()
      expect(prependSafeToL2Migration(safeTx, safeInfo, chainBuilder().with({ l2: true }).build())).resolves.toEqual(
        safeTx,
      )
    })

    it('should not modify tx if the tx is already signed', () => {
      const safeTx = safeTxBuilder()
        .with({ data: safeTxDataBuilder().with({ nonce: 0 }).build() })
        .build()

      safeTx.addSignature(safeSignatureBuilder().build())

      const safeInfo = extendedSafeInfoBuilder()
        .with({ implementationVersionState: ImplementationVersionState.UNKNOWN })
        .build()

      expect(prependSafeToL2Migration(safeTx, safeInfo, chainBuilder().with({ l2: true }).build())).resolves.toEqual(
        safeTx,
      )
    })

    it('should not modify tx if the tx already migrates', () => {
      const safeTx = safeTxBuilder()
        .with({
          data: safeTxDataBuilder()
            .with({
              nonce: 0,
              to: SAFE_TO_L2_MIGRATION_ADDRESS,
              data: SAFE_TO_L2_INTERFACE.encodeFunctionData('migrateToL2', [
                getSafeL2SingletonDeployment()?.defaultAddress,
              ]),
            })
            .build(),
        })
        .build()

      const safeInfo = extendedSafeInfoBuilder()
        .with({
          implementationVersionState: ImplementationVersionState.UNKNOWN,
          implementation: {
            name: '1.3.0',
            value: getSafeSingletonDeployment()?.defaultAddress ?? faker.finance.ethereumAddress(),
          },
        })
        .build()

      expect(
        prependSafeToL2Migration(safeTx, safeInfo, chainBuilder().with({ l2: true, chainId: '10' }).build()),
      ).resolves.toEqual(safeTx)

      const multiSendSafeTx = safeTxBuilder()
        .with({
          data: safeTxDataBuilder()
            .with({
              nonce: 0,
              to: getMultiSendDeployment()?.defaultAddress,
              data: Multi_send__factory.createInterface().encodeFunctionData('multiSend', [
                encodeMultiSendData([
                  {
                    value: '0',
                    operation: 1,
                    to: SAFE_TO_L2_MIGRATION_ADDRESS,
                    data: SAFE_TO_L2_INTERFACE.encodeFunctionData('migrateToL2', [
                      getSafeL2SingletonDeployment()?.defaultAddress,
                    ]),
                  },
                ]),
              ]),
            })
            .build(),
        })
        .build()

      expect(
        prependSafeToL2Migration(multiSendSafeTx, safeInfo, chainBuilder().with({ l2: true, chainId: '10' }).build()),
      ).resolves.toEqual(multiSendSafeTx)
    })

    it('should modify single txs if applicable', async () => {
      const safeTx = safeTxBuilder()
        .with({
          data: safeTxDataBuilder()
            .with({
              nonce: 0,
              to: faker.finance.ethereumAddress(),
              data: faker.string.hexadecimal({ length: 10 }),
              value: '0',
            })
            .build(),
        })
        .build()

      const safeInfo = extendedSafeInfoBuilder()
        .with({
          implementationVersionState: ImplementationVersionState.UNKNOWN,
          implementation: {
            name: '1.3.0',
            value: getSafeSingletonDeployment()?.defaultAddress ?? faker.finance.ethereumAddress(),
          },
        })
        .build()

      const modifiedTx = await prependSafeToL2Migration(
        safeTx,
        safeInfo,
        chainBuilder().with({ l2: true, chainId: '10' }).build(),
      )

      expect(modifiedTx).not.toEqual(safeTx)
      expect(modifiedTx?.data.to).toEqual(getMultiSendDeployment()?.defaultAddress)
      const decodedMultiSend = decodeMultiSendData(modifiedTx!.data.data)
      expect(decodedMultiSend).toHaveLength(2)
      expect(decodedMultiSend).toEqual([
        {
          to: SAFE_TO_L2_MIGRATION_ADDRESS,
          value: '0',
          operation: 1,
          data: SAFE_TO_L2_INTERFACE.encodeFunctionData('migrateToL2', [
            getSafeL2SingletonDeployment()?.defaultAddress,
          ]),
        },
        {
          to: checksumAddress(safeTx.data.to),
          value: safeTx.data.value,
          operation: safeTx.data.operation,
          data: safeTx.data.data.toLowerCase(),
        },
      ])
    })
  })
})
