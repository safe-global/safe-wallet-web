import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import { TransactionReceipt } from 'web3-core'

export enum PENDING_STATE {
  SUBMITTING = 'SUBMITTING',
  MINING = 'MINING',
  MINED = 'MINED',
  FAILED = 'FAILED',
}

interface PendingTxsState {
  [txId: string]: {
    chainId: string
    state?: PENDING_STATE
    txHash?: string
    error?: Error
  }
}

const initialState: PendingTxsState = {}

const getPendingTx = (pendingTx: PendingTxsState[string], state: PENDING_STATE) => {
  return {
    ...(pendingTx || {}),
    state,
  }
}

export const pendingTxsSlice = createSlice({
  name: 'pendingTxs',
  initialState,
  reducers: {
    setTxSigningFailed: (state, action: PayloadAction<{ error: Error }>) => {
      return state
    },
    setTxProposalFailed: (state, action: PayloadAction<{ error: Error }>) => {
      return state
    },
    setTxSubmitting: (state, action: PayloadAction<{ txId: string }>) => {
      const { txId } = action.payload

      delete state[txId]?.error

      state[txId] = getPendingTx(state[txId], PENDING_STATE.SUBMITTING)
    },
    setTxMining: (state, action: PayloadAction<{ txId: string; txHash: string; block?: number }>) => {
      const { txId, txHash } = action.payload

      state[txId] = {
        ...getPendingTx(state[txId], PENDING_STATE.MINING),
        txHash,
      }
    },
    setTxMined: (state, action: PayloadAction<{ txId: string; receipt: TransactionReceipt }>) => {
      const { txId } = action.payload

      delete state[txId]?.txHash

      state[txId] = getPendingTx(state[txId], PENDING_STATE.MINED)
    },
    setTxFailed: (state, action: PayloadAction<{ txId: string; error: Error }>) => {
      const { txId, error } = action.payload

      state[txId] = {
        ...getPendingTx(state[txId], PENDING_STATE.FAILED),
        error,
      }
    },
    removePendingTx: (state, action: PayloadAction<{ txId: string }>) => {
      const { txId } = action.payload

      delete state[txId]
    },
  },
})

export const {
  setTxSigningFailed,
  setTxProposalFailed,
  setTxSubmitting,
  setTxMining,
  setTxMined,
  setTxFailed,
  removePendingTx,
} = pendingTxsSlice.actions

export const selectPendingTxs = (state: RootState): PendingTxsState => {
  return state[pendingTxsSlice.name]
}

export const selectPendingTxById = createSelector(
  [selectPendingTxs, (_, txId: string) => txId],
  (state, txId) => state[txId],
)
