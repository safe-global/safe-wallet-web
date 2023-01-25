import {
  ConflictType,
  DetailedExecutionInfoType,
  LabelValue,
  TransactionListItemType,
} from '@safe-global/safe-gateway-typescript-sdk'
import type {
  TransactionListPage,
  Page,
  TransactionListItem,
  TransactionSummary,
} from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import { _shouldExpandSafeList } from '..'
import { addActionsToSafeTxs } from '@/utils/queuedTxsActions'

describe('SafeList', () => {
  describe('shouldExpandSafeList', () => {
    it('should expand if the current Safe is not owned', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x1']
      const addedSafesOnChain = {}

      expect(_shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })).toBe(
        true,
      )
    })
    it('should expand if the current Safe is owned but not added', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it("shouldn't expand if the current Safe is owned but added", () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {
        [safeAddress]: {
          owners: [],
          threshold: 1,
        },
      }

      _shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it('should expand if there are no added Safes and the owned number is less than the limit', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: false, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it("should't expand if there are no added Safes and the owned number is over the limit", () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0', '0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: false, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
  })
  describe('addActionsToTxs', () => {
    it('should return an empty object', () => {
      const page: Page<TransactionListItem> = {
        next: undefined,
        previous: undefined,
        results: [],
      }
      const mockSafeAddress = hexZeroPad('0x1', 20)
      const walletAddress = hexZeroPad('0x789', 20)

      const result = addActionsToSafeTxs('5', mockSafeAddress, page, true, {}, walletAddress)

      expect(result).toEqual({})
    })
    it('should return 2 queued txs and 1 pending signature', () => {
      const page: TransactionListPage = {
        next: undefined,
        previous: undefined,
        results: [
          { type: TransactionListItemType.LABEL, label: LabelValue.Next },
          { type: TransactionListItemType.CONFLICT_HEADER, nonce: 7 },
          {
            type: TransactionListItemType.TRANSACTION,
            transaction: {
              executionInfo: {
                type: DetailedExecutionInfoType.MULTISIG,
                nonce: 7,
                confirmationsRequired: 3,
                confirmationsSubmitted: 1,
                missingSigners: [
                  { value: '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC' },
                  { value: '0x0000000000000000000000000000000000000789' },
                ],
              },
            } as unknown as TransactionSummary,
            conflictType: ConflictType.HAS_NEXT,
          },
          {
            type: TransactionListItemType.TRANSACTION,
            transaction: {
              executionInfo: {
                type: DetailedExecutionInfoType.MULTISIG,
                nonce: 7,
                confirmationsRequired: 3,
                confirmationsSubmitted: 3,
              },
            } as unknown as TransactionSummary,
            conflictType: ConflictType.END,
          },
        ],
      }
      const mockSafeAddress = hexZeroPad('0x1', 20)
      const walletAddress = hexZeroPad('0x789', 20)

      const result = addActionsToSafeTxs('5', mockSafeAddress, page, true, {}, walletAddress)

      expect(result).toEqual({
        '5': {
          '0x0000000000000000000000000000000000000001': {
            queued: '2',
            signing: 1,
          },
        },
      })
    })
    it('should not calculate pending signatures if address is not owner', () => {
      const page: TransactionListPage = {
        next: undefined,
        previous: undefined,
        results: [
          { type: TransactionListItemType.LABEL, label: LabelValue.Next },
          { type: TransactionListItemType.CONFLICT_HEADER, nonce: 7 },
          {
            type: TransactionListItemType.TRANSACTION,
            transaction: {
              executionInfo: {
                type: DetailedExecutionInfoType.MULTISIG,
                nonce: 7,
                confirmationsRequired: 3,
                confirmationsSubmitted: 1,
                missingSigners: [
                  { value: '0x6a5602335a878ADDCa4BF63a050E34946B56B5bC' },
                  { value: '0x0000000000000000000000000000000000000789' },
                ],
              },
            } as unknown as TransactionSummary,
            conflictType: ConflictType.HAS_NEXT,
          },
          {
            type: TransactionListItemType.TRANSACTION,
            transaction: {
              executionInfo: {
                type: DetailedExecutionInfoType.MULTISIG,
                nonce: 7,
                confirmationsRequired: 3,
                confirmationsSubmitted: 3,
              },
            } as unknown as TransactionSummary,
            conflictType: ConflictType.END,
          },
        ],
      }
      const mockSafeAddress = hexZeroPad('0x1', 20)
      const walletAddress = hexZeroPad('0x789', 20)

      const result = addActionsToSafeTxs('5', mockSafeAddress, page, false, {}, walletAddress)

      expect(result).toEqual({
        '5': {
          '0x0000000000000000000000000000000000000001': {
            queued: '2',
          },
        },
      })
    })
    it('should return 20+ queued txs and no pending signatures', () => {
      const mock20Transactions: TransactionListItem[] = []
      for (let i = 0; i < 20; i++) {
        mock20Transactions.push({
          type: TransactionListItemType.TRANSACTION,
          transaction: {} as unknown as TransactionSummary,
          conflictType: ConflictType.NONE,
        })
      }

      const page: TransactionListPage = {
        next: 'link to the next page',
        previous: undefined,
        results: [{ type: TransactionListItemType.LABEL, label: LabelValue.Next }, ...mock20Transactions],
      }
      const mockSafeAddress = hexZeroPad('0x1', 20)
      const walletAddress = hexZeroPad('0x789', 20)

      const result = addActionsToSafeTxs('5', mockSafeAddress, page, true, {}, walletAddress)

      expect(result).toEqual({
        '5': {
          '0x0000000000000000000000000000000000000001': {
            queued: '20+',
          },
        },
      })
    })
  })
})
