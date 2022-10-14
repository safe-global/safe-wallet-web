import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'

// A map of chain ids to a list of draft tx ids
type DraftTxsState = { [chainId: string]: string[] }

const initialState: DraftTxsState = {}

export const draftTxsSlice = createSlice({
  name: 'draftTxs',
  initialState,
  reducers: {
    addDraftTx: (
      state,
      action: PayloadAction<{
        chainId: string
        txId: string
      }>,
    ) => {
      const { chainId, txId } = action.payload
      if (!state[chainId]) state[chainId] = []
      state[chainId].push(txId)
    },
    removeDraftTx: (
      state,
      action: PayloadAction<{
        chainId: string
        txId: string
      }>,
    ) => {
      const { chainId, txId } = action.payload
      state[chainId] = (state[chainId] || []).filter((id) => id !== txId)
    },
  },
})

export const { addDraftTx, removeDraftTx } = draftTxsSlice.actions

const selectAllDraftTxs = (state: RootState): DraftTxsState => {
  return state[draftTxsSlice.name]
}

export const selectDraftTxsByChainId = createSelector(
  [selectAllDraftTxs, (_, chainId: string) => chainId],
  (allDrafts, chainId): string[] => {
    return allDrafts[chainId] || []
  },
)
