import type { RootState } from '..'
import { PendingStatus, selectPendingTxById, type PendingTxsState } from '../pendingTxsSlice'
import { selectPendingTxIdsBySafe } from '../pendingTxsSlice'

const pendingTxs: PendingTxsState = {
  '123': {
    nonce: 1,
    chainId: '5',
    safeAddress: '0x123',
    status: PendingStatus.INDEXING,
  },
  '456': {
    nonce: 1,
    chainId: '5',
    safeAddress: '0x456',
    status: PendingStatus.INDEXING,
  },
}

describe('pendingTxsSlice', () => {
  it('should select pending txs based on safe address and chain id', () => {
    expect(selectPendingTxIdsBySafe({ pendingTxs } as unknown as RootState, '5', '0x123')).toEqual(['123'])
  })

  it('should return an empty array if no pending txs are found in a safe', () => {
    expect(selectPendingTxIdsBySafe({ pendingTxs } as unknown as RootState, '5', '0x789')).toEqual([])
  })

  it('should return an empty array if no pending txs are found on chain', () => {
    expect(selectPendingTxIdsBySafe({ pendingTxs } as unknown as RootState, '1', '0x456')).toEqual([])
  })

  it('should select a pending tx by id', () => {
    expect(selectPendingTxById({ pendingTxs } as unknown as RootState, '456')).toEqual({
      nonce: 1,
      chainId: '5',
      safeAddress: '0x456',
      status: PendingStatus.INDEXING,
    })
  })

  it('should return undefined if no tx found', () => {
    expect(selectPendingTxById({ pendingTxs } as unknown as RootState, '789')).toEqual(undefined)
  })
})
