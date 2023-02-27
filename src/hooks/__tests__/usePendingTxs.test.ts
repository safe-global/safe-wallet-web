import { type PendingTx } from '@/store/pendingTxsSlice'
import { act, renderHook } from '@/tests/test-utils'
import type { Label, Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { useHasPendingTxs, usePendingTxsQueue } from '../usePendingTxs'

// Mock getTransactionQueue
jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  getTransactionQueue: () =>
    Promise.resolve({
      next: null,
      previous: null,
      results: [
        {
          type: 'LABEL',
          label: 'Next',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_123',
          },
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_456',
          },
        },
      ],
    }),
}))

describe('usePendingTxsQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should return the pending txs queue', async () => {
    const { result } = renderHook(() => usePendingTxsQueue(), {
      initialReduxState: {
        pendingTxs: {
          multisig_123: {
            chainId: '4',
            txHash: 'tx123',
          } as PendingTx,
        },
      },
    })

    expect(result?.current.loading).toBe(true)

    await act(() => Promise.resolve(true))

    const resultItems = result?.current.page?.results

    expect(result?.current.loading).toBe(false)
    expect(result?.current.page).toBeDefined()
    expect(resultItems?.length).toBe(2)
    expect((resultItems?.[0] as Label).label).toBe('Pending')
    expect((resultItems?.[1] as Transaction).transaction.id).toBe('multisig_123')
  })
})

describe('useHasPendingTxs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should return true if there are pending txs', () => {
    const { result } = renderHook(() => useHasPendingTxs(), {
      initialReduxState: {
        pendingTxs: {
          multisig_123: {
            chainId: '5',
            txHash: 'tx123',
          } as PendingTx,

          multisig_456: {
            chainId: '4',
            txHash: 'tx456',
          } as PendingTx,
        },
      },
    })

    expect(result?.current).toBe(true)
  })

  it('should return falseif there are no pending txs for the current chain', () => {
    const { result } = renderHook(() => useHasPendingTxs(), {
      initialReduxState: {
        pendingTxs: {
          multisig_789: {
            chainId: '1',
            txHash: 'tx789',
          } as PendingTx,
        },
      },
    })

    expect(result?.current).toBe(false)
  })
})
