import { getChainsConfig, type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  isRaceCondition,
  type ThunkState,
} from './thunkState'
import type { RootState } from '@/store'

type ChainsState = {
  configs: ChainInfo[]
} & ThunkState

const initialState: ChainsState = {
  configs: [],
  ...initialThunkState,
}

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchChains.pending, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getPendingState(state, action)
      }
    })
    builder.addCase(fetchChains.fulfilled, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getFulfilledState(state, action)
        state.configs = action.payload.results
      }
    })
    builder.addCase(fetchChains.rejected, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getRejectedState(state, action)

        logError(Errors._904, action.error.message)
      }
    })
  },
})

export const fetchChains = createAsyncThunk(`${chainsSlice.name}/fetchChains`, async () => {
  return await getChainsConfig()
})

export const selectChains = (state: RootState): ChainsState => {
  return state.chains
}

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  ({ configs }, chainId) => {
    return configs.find((item) => item.chainId === chainId)
  },
)
