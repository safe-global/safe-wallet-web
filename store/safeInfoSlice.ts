import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getSafeInfo, type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { logError, Errors } from '@/services/exceptions'
import {
  getFulfilledState,
  getPendingState,
  getRejectedState,
  initialThunkState,
  isRaceCondition,
  type ThunkState,
} from '@/store/thunkState'
import type { RootState } from '@/store'

type SafeInfoState = {
  safe?: SafeInfo
} & ThunkState

const initialState: SafeInfoState = {
  safe: undefined,
  ...initialThunkState,
}

export const safeInfoSlice = createSlice({
  name: 'safeInfo',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSafeInfo.pending, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getPendingState(action))
    })
    builder.addCase(fetchSafeInfo.fulfilled, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getFulfilledState(action), { safe: action.payload })
    })
    builder.addCase(fetchSafeInfo.rejected, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getRejectedState(action))

      logError(Errors._605, action.error.message)
    })
  },
})

export const fetchSafeInfo = createAsyncThunk<SafeInfo, { chainId: string; address: string }>(
  `${safeInfoSlice.name}/fetchSafeInfo`,
  async ({ chainId, address }) => {
    return await getSafeInfo(chainId, address)
  },
)

export const selectSafeInfo = (state: RootState): SafeInfoState => {
  return state[safeInfoSlice.name]
}
