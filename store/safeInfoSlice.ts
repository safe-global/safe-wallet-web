import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getSafeInfo, type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { logError, Errors } from '@/services/exceptions'
import { initialFetchState, LOADING_STATUS, type FetchState } from '@/store/fetchThunkState'
import type { RootState } from '@/store'

type SafeInfoState = {
  safe?: SafeInfo
} & FetchState

const initialState: SafeInfoState = {
  safe: undefined,
  ...initialFetchState,
}

export const safeInfoSlice = createSlice({
  name: 'safeInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSafeInfo.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })
    builder.addCase(fetchSafeInfo.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      state.safe = payload
    })
    builder.addCase(fetchSafeInfo.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._605, error.message)
    })
  },
})

export const fetchSafeInfo = createAsyncThunk(
  `${safeInfoSlice.name}/fetchSafeInfo`,
  async ({ chainId, address }: { chainId: string; address: string }, { signal }) => {
    return await getSafeInfo(chainId, address, undefined, signal)
  },
)

export const selectSafeInfo = (state: RootState): SafeInfoState => {
  return state[safeInfoSlice.name]
}
