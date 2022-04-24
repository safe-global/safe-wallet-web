import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'
import { getChainsConfig, type ChainInfo, type ChainListResponse } from '@gnosis.pm/safe-react-gateway-sdk'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  type ThunkState,
} from '@/store/thunkState'
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
      Object.assign(state, getPendingState(action))
    })
    builder.addCase(fetchChains.fulfilled, (state, action) => {
      Object.assign(state, getFulfilledState(action), { configs: action.payload.results })
    })
    builder.addCase(fetchChains.rejected, (state, action) => {
      Object.assign(state, getRejectedState(action))

      logError(Errors._904, action.error.message)
    })
  },
})

export const fetchChains = createAsyncThunk<ChainListResponse>(`${chainsSlice.name}/fetchChains`, async () => {
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
