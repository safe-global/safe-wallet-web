import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCollectibles, SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'

import type { RootState } from '@/store'
import { initialFetchState, LOADING_STATUS, type FetchState } from '@/store/fetchThunkState'
import { logError, Errors } from '@/services/exceptions'

type CollectiblesState = {
  items: SafeCollectibleResponse[]
} & FetchState

const initialState: CollectiblesState = {
  items: [],
  ...initialFetchState,
}

export const collectiblesSlice = createSlice({
  name: 'collectibles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCollectibles.pending, () => ({
      ...initialState, // Reset balance when fetching as it's a new Safe
      status: LOADING_STATUS.PENDING,
      error: undefined,
    }))
    builder.addCase(fetchCollectibles.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      status: LOADING_STATUS.SUCCEEDED,
    }))
    builder.addCase(fetchCollectibles.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._604, error.message)
    })
  },
})

export const fetchCollectibles = createAsyncThunk(
  `${collectiblesSlice.name}/fetchCollectibles`,
  async ({ chainId, address }: { chainId: string; address: string }, { signal }) => {
    return await getCollectibles(chainId, address, undefined, signal)
  },
)

export const selectCollectibles = (state: RootState): CollectiblesState => {
  return state[collectiblesSlice.name]
}
