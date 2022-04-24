import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCollectibles, type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'

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
      // Reset collectibles when fetching as it's a new Safe
      Object.assign(state, initialState, getPendingState(action))
    })
    builder.addCase(fetchCollectibles.fulfilled, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getFulfilledState(action), { items: action.payload })
    })
    builder.addCase(fetchCollectibles.rejected, (state, action) => {
      if (isRaceCondition(state, action)) return
      Object.assign(state, getRejectedState(action))

      logError(Errors._601, action.error.message)
    })
  },
})

export const fetchCollectibles = createAsyncThunk<SafeCollectibleResponse[], { chainId: string; address: string }>(
  `${collectiblesSlice.name}/fetchCollectibles`,
  async ({ chainId, address }) => {
    return await getCollectibles(chainId, address)
  },
)

export const selectCollectibles = (state: RootState): CollectiblesState => {
  return state[collectiblesSlice.name]
}
