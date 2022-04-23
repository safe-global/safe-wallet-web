import { getBalances, type SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { logError, Errors } from '@/services/exceptions'
import { initialFetchState, LOADING_STATUS, type FetchState } from './fetchThunkState'
import type { RootState } from '@/store'

type BalancesState = SafeBalanceResponse & FetchState

const initialState: BalancesState = {
  fiatTotal: '0',
  items: [],
  ...initialFetchState,
}

export const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBalances.pending, () => ({
      ...initialState, // Reset balance when fetching as it's a new Safe
      status: LOADING_STATUS.PENDING,
      error: undefined,
    }))
    builder.addCase(fetchBalances.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      status: LOADING_STATUS.SUCCEEDED,
    }))
    builder.addCase(fetchBalances.rejected, (state, { error, meta }) => {
      if (meta.aborted) {
        return
      }

      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._601, error.message)
    })
  },
})

export const fetchBalances = createAsyncThunk(
  `${balancesSlice.name}/fetchBalances`,
  async ({ chainId, address }: { chainId: string; address: string }, { signal }) => {
    // TODO: Fetching in the selected currency
    return await getBalances(chainId, address, undefined, undefined, signal)
  },
)

export const selectBalances = (state: RootState): BalancesState => {
  return state[balancesSlice.name]
}
