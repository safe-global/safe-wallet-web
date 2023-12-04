import { faker } from '@faker-js/faker'
import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import type { TransactionListItem } from '@safe-global/safe-gateway-typescript-sdk'

import {
  filterEmptyLabels,
  filterNoNonceTransfers,
  groupConflictingTxs,
  groupRecoveryTransactions,
  _getRecoveryCancellations,
} from '@/utils/tx-list'

describe('tx-list', () => {
  describe('groupConflictingTxs', () => {
    it('should group conflicting transactions', () => {
      const list = [
        { type: 'CONFLICT_HEADER' },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
          },
          conflictType: 'HasNext',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
          },
          conflictType: 'End',
        },
      ]

      const result = groupConflictingTxs(list as TransactionListItem[])
      expect(result).toEqual([
        [
          {
            type: 'TRANSACTION',
            transaction: {
              id: 1,
            },
            conflictType: 'HasNext',
          },
          {
            type: 'TRANSACTION',
            transaction: {
              id: 2,
            },
            conflictType: 'End',
          },
        ],
      ])
    })

    it('should organise group by timestamp', () => {
      const list = [
        { type: 'CONFLICT_HEADER' },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
            timestamp: 1,
          },
          conflictType: 'HasNext',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
            timestamp: 2,
          },
          conflictType: 'End',
        },
      ]

      const result = groupConflictingTxs(list as TransactionListItem[])
      expect(result).toEqual([
        [
          {
            type: 'TRANSACTION',
            transaction: {
              id: 2,
              timestamp: 2,
            },
            conflictType: 'End',
          },
          {
            type: 'TRANSACTION',
            transaction: {
              id: 1,
              timestamp: 1,
            },
            conflictType: 'HasNext',
          },
        ],
      ])
    })

    it('should return non-conflicting transaction lists as is', () => {
      const list = [
        {
          type: 'TRANSACTION',
          transaction: {
            id: 1,
          },
          conflictType: 'None',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 2,
          },
          conflictType: 'None',
        },
      ]

      const result = groupConflictingTxs(list as unknown as TransactionListItem[])
      expect(result).toEqual(list)
    })
  })

  describe('getRecoveryCancellations', () => {
    it('should return cancellation transactions', () => {
      const moduleAddress = faker.finance.ethereumAddress()

      const transactions = [
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'enableModule',
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.TRANSFER,
            },
          },
        },
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ]

      expect(_getRecoveryCancellations(moduleAddress, transactions as any)).toEqual([
        {
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ])
    })
  })

  describe('groupRecoveryTransactions', () => {
    it('should group recovery transactions with their cancellations', () => {
      const moduleAddress = faker.finance.ethereumAddress()
      const moduleAddress2 = faker.finance.ethereumAddress()

      const queue = [
        {
          type: 'TRANSACTION',
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'enableModule',
            },
          },
        },
        {
          type: 'TRANSACTION',
          transaction: {
            txInfo: {
              type: TransactionInfoType.TRANSFER,
            },
          },
        },
        {
          type: 'TRANSACTION',
          transaction: {
            txInfo: {
              type: TransactionInfoType.CUSTOM,
              to: {
                value: moduleAddress,
              },
              methodName: 'setTxNonce',
            },
          },
        },
      ]

      const recoveryQueue = [
        {
          address: moduleAddress,
        },
        {
          address: moduleAddress2,
        },
      ]

      expect(groupRecoveryTransactions(queue as any, recoveryQueue as any)).toEqual([
        [
          {
            address: moduleAddress,
          },
          {
            type: 'TRANSACTION',
            transaction: {
              txInfo: {
                type: TransactionInfoType.CUSTOM,
                to: {
                  value: moduleAddress,
                },
                methodName: 'setTxNonce',
              },
            },
          },
        ],
        {
          address: moduleAddress2,
        },
      ])
    })
  })

  /*
export const filterNoNonceTransfers = (item: TransactionListItem): boolean => {
  return !(
    isTransactionListItem(item) &&
    isOutgoingTransfer(item.transaction.txInfo) &&
    !item.transaction.executionInfo &&
    isTransferTxInfo(item.transaction.txInfo) &&
    isERC20Transfer(item.transaction.txInfo.transferInfo) &&
    !item.transaction.txInfo.humanDescription
  )
}

export const filterEmptyLabels = (item: TransactionListItem, index: number, txList: TransactionListItem[]): boolean => {
  const nextItem = txList[index + 1]
  return (!isDateLabel(item) && !isLabelListItem(item)) || (nextItem && isTransactionListItem(nextItem))
}
     */

  describe('Tx list filters', () => {
    it('should filter tx list by no nonce transfers', () => {
      const list = [
        // Legit date label
        {
          type: 'DATE_LABEL',
          timestamp: 1701561600000,
        },

        // Legit tx
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_123',
            timestamp: 1701586619000,
            txStatus: 'SUCCESS',
            txInfo: {
              type: 'Transfer',
              humanDescription: 'Send 500 USDT to 0x1234...5678',
              richDecodedInfo: {},
              direction: 'OUTGOING',
              transferInfo: {
                type: 'ERC20',
                tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
                value: '500000000',
                tokenName: 'Tether USD',
                tokenSymbol: 'USDT',
                logoUri:
                  'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xdAC17F958D2ee523a2206206994597C13D831ec7.png',
                decimals: 6,
              },
            },
            executionInfo: {
              type: 'MULTISIG',
              nonce: 97,
              confirmationsRequired: 2,
              confirmationsSubmitted: 2,
              missingSigners: null,
            },
            safeAppInfo: null,
          },
          conflictType: 'None',
        },

        // No nonce transfer
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'transfer_',
            timestamp: 1701665639000,
            txStatus: 'SUCCESS',
            txInfo: {
              type: 'Transfer',
              humanDescription: null,
              richDecodedInfo: null,
              direction: 'OUTGOING',
              transferInfo: {
                type: 'ERC20',
                tokenAddress: '0xc610fC656e8c4E3CdC3F0bAfE3AEBB98B4A42796',
                value: '11000000000',
                tokenName: 'Tеthеr USD',
                tokenSymbol: 'USDT',
                logoUri:
                  'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xc610fC656e8c4E3CdC3F0bAfE3AEBB98B4A42796.png',
                decimals: 6,
              },
            },
            executionInfo: null,
            safeAppInfo: null,
          },
          conflictType: 'None',
        },
      ] as unknown as TransactionListItem[]

      const result = list.filter(filterNoNonceTransfers)

      expect(result.length).toBe(2)
      expect(result[0].type).toBe('DATE_LABEL')
      expect(result[1].type).toBe('TRANSACTION')
      expect('transaction' in result[1] && result[1].transaction.id).toBe('multisig_123')
    })

    it('should filter tx list by empty labels', () => {
      const list = [
        // "Empty" date label
        {
          type: 'DATE_LABEL',
          timestamp: 1701561600000,
        },

        // Legit date label
        {
          type: 'DATE_LABEL',
          timestamp: 2701561600001,
        },

        // Legit tx
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_123',
          },
        },
      ] as unknown as TransactionListItem[]

      const result = list.filter(filterEmptyLabels)

      expect(result.length).toBe(2)
      expect(result[0].type).toBe('DATE_LABEL')
      expect('timestamp' in result[0] && result[0].timestamp).toBe(2701561600001)
      expect(list.filter(filterEmptyLabels)[1].type).toBe('TRANSACTION')
    })
  })
})
