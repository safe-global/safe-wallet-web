import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { SetHistoryPageAction, txHistorySlice } from './txHistorySlice'
import { isTransaction } from '@/components/transactions/utils'
import type { RootState } from '@/store'

interface PendingTxsState {
  [chainId: string]: {
    [txId: string]: string // txHash
  }
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setPendingTx: (state, action: PayloadAction<{ chainId: string; txId: string; txHash: string }>) => {
      const { chainId, txId, txHash } = action.payload
      return {
        ...state,
        [chainId]: {
          ...state[chainId],
          [txId]: txHash,
        },
      }
    },
    removePendingTx: (state, action: PayloadAction<{ txId: string; chainId: string }>) => {
      const { chainId, txId } = action.payload

      // Omit txId from the pending txs on current chain
      const { [txId]: _, ...newChainState } = state[chainId] || {}

      if (Object.keys(newChainState || {}).length === 0) {
        // Omit chainId from the pending txs if no pending txs on chain
        const { [chainId]: _, ...newState } = state
        return newState
      }

      return {
        ...state,
        [chainId]: newChainState,
      }
    },
  },
  extraReducers: (builder) => {
    // Remove any pending transactions that are now historical
    builder.addMatcher(
      ({ type }) => type === txHistorySlice.actions.setHistoryPage.type,
      (state, action: SetHistoryPageAction) => {
        if (!action.payload) {
          return
        }

        const pendingChainIds = Object.keys(state)

        for (const result of action.payload.results) {
          if (!isTransaction(result)) {
            continue
          }

          const { id } = result.transaction

          const chainId = pendingChainIds.find((chainId) => state[chainId][id])

          if (!chainId) {
            continue
          }

          delete state[chainId][id]

          if (Object.keys(state[chainId]).length > 0) {
            continue
          }

          delete state[chainId]
        }
      },
    )
  },
})

export const { setPendingTx, removePendingTx } = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTx = createSelector(
  selectPendingTxs,
  (_: RootState, details: { chainId: string; txId: string }) => details,
  (pendingTxs, { chainId, txId }) => {
    return pendingTxs[chainId]?.[txId]
  },
)
