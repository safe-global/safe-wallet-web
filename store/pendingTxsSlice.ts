import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { getWeb3 } from '@/services/wallets/web3'
import type { RootState } from '@/store'

interface PendingTxsState {
  [chainId: string]: {
    [txId: string]: {
      txHash: string
      block?: number
    }
  }
}

const initialState: PendingTxsState = {}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    addPendingTx: (state, action: PayloadAction<{ chainId: string; txId: string; txHash: string; block?: number }>) => {
      const { chainId, txId, txHash, block } = action.payload
      return {
        ...state,
        [chainId]: {
          ...state[chainId],
          [txId]: {
            txHash,
            block,
          },
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
})

export const { removePendingTx } = pendingTxsSlice.actions

export const setPendingTx = createAsyncThunk<void, { chainId: string; txId: string; txHash: string }>(
  `${pendingTxsSlice.name}/setPendingTx`,
  async (details, { dispatch }) => {
    let block: number | undefined

    try {
      block = await getWeb3().eth.getBlockNumber()
    } catch {
      // ignore
    }

    dispatch(
      pendingTxsSlice.actions.addPendingTx({
        ...details,
        block,
      }),
    )
  },
)

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
