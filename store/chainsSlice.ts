import { getChainsConfig, type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import { initialFetchState, LOADING_STATUS, type FetchState } from './fetchThunkState'
import type { RootState } from '@/store'

type ChainsState = {
  configs: ChainInfo[]
} & FetchState

const initialState: ChainsState = {
  configs: [],
  ...initialFetchState,
}

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchChains.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })
    builder.addCase(fetchChains.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      state.configs = payload.results
    })
    builder.addCase(fetchChains.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._904, error.message)
    })
  },
})

export const fetchChains = createAsyncThunk(`${chainsSlice.name}/fetchChains`, async (_, { signal }) => {
  return await getChainsConfig(undefined, signal)
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
