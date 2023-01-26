import usePendingActions from '@/hooks/usePendingActions'
import { renderHook, waitFor } from '@/tests/test-utils'
import type { TransactionListPage, TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import {
  ConflictType,
  DetailedExecutionInfoType,
  LabelValue,
  TransactionListItemType,
} from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import type { EIP1193Provider } from '@web3-onboard/core'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useTxQueue from '@/hooks/useTxQueue'
import { getTransactionQueue } from '@safe-global/safe-gateway-typescript-sdk'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  getTransactionQueue: jest.fn(),
}))

describe('usePendingActions hook', () => {
  it('should return no pending actions for non-current Safe with an empty queue', () => {
    const chainId = '5'
    const safeAddress = hexZeroPad('0x1', 20)

    ;(getTransactionQueue as jest.Mock).mockResolvedValue({
      next: undefined,
      previous: undefined,
      results: [],
    })

    const { result } = renderHook(() => usePendingActions(chainId, safeAddress))
    expect(result.current).toEqual({ totalQueued: '', totalToSign: '' })
  })

  it('should return no pending actions for current Safe with an empty queue', () => {
    const chainId = '5'
    const safeAddress = hexZeroPad('0x1', 20)

    const mockPage = {
      error: undefined,
      loading: false,
      page: {
        next: undefined,
        previous: undefined,
        results: [],
      },
    }
    jest.spyOn(useTxQueue, 'default').mockReturnValue(mockPage)

    const { result } = renderHook(() => usePendingActions(chainId, safeAddress))
    expect(result.current).toEqual({ totalQueued: '', totalToSign: '' })
  })

  it('should return 2 queued txs and 1 pending signature for non-current Safe with a queue', async () => {
    const walletAddress = hexZeroPad('0x789', 20)
    const mockWallet = {
      address: walletAddress,
      chainId: '5',
      label: '',
      provider: null as unknown as EIP1193Provider,
    }
    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider })

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

    ;(getTransactionQueue as jest.Mock).mockResolvedValue(page)

    const chainId = '5'
    const safeAddress = hexZeroPad('0x1', 20)

    const { result } = renderHook(() => usePendingActions(chainId, safeAddress))

    await waitFor(() => {
      expect(result.current).toEqual({ totalQueued: '2', totalToSign: '1' })
    })
  })

  it('should return 2 queued txs and 1 pending signature for current Safe with a queue', async () => {
    const walletAddress = hexZeroPad('0x789', 20)
    const mockWallet = {
      address: walletAddress,
      chainId: '5',
      label: '',
      provider: null as unknown as EIP1193Provider,
    }
    jest.spyOn(useWallet, 'default').mockReturnValue({ ...mockWallet, provider: {} as EIP1193Provider })

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

    const mockPage = {
      error: undefined,
      loading: false,
      page,
    }
    jest.spyOn(useTxQueue, 'default').mockReturnValue(mockPage)

    const chainId = '5'
    const safeAddress = hexZeroPad('0x1', 20)

    const { result } = renderHook(() => usePendingActions(chainId, safeAddress))

    await waitFor(() => {
      expect(result.current).toEqual({ totalQueued: '2', totalToSign: '1' })
    })
  })
})
