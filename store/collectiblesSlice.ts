import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCollectibles, SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'

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

type CollectiblesState = {
  items: SafeCollectibleResponse[]
} & ThunkState

const initialState: CollectiblesState = {
  items: [],
  ...initialThunkState,
}

export const collectiblesSlice = createSlice({
  name: 'collectibles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCollectibles.pending, (state, action) => {
      if (!isRaceCondition(state, action)) {
        // Reset collectibles when fetching as it's a new Safe
        state = getPendingState(initialState, action)
      }
    })
    builder.addCase(fetchCollectibles.fulfilled, (state, action) => {
      if (!isRaceCondition(state, action)) {
        return {
          ...getFulfilledState(state, action),
          ...action.payload,
        }
      }
    })
    builder.addCase(fetchCollectibles.rejected, (state, action) => {
      if (!isRaceCondition(state, action)) {
        state = getRejectedState(state, action)

        logError(Errors._601, action.error.message)
      }
    })
  },
})

export const fetchCollectibles = createAsyncThunk(
  `${collectiblesSlice.name}/fetchCollectibles`,
  async ({ chainId, address }: { chainId: string; address: string }) => {
    return await getCollectibles(chainId, address)
  },
)

export const selectCollectibles = (state: RootState): CollectiblesState => {
  return state[collectiblesSlice.name]
}
