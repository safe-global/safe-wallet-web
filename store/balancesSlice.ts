import { getBalances, type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSlice, SerializedError } from '@reduxjs/toolkit'

import { GATEWAY_URL } from 'config/constants'
import { LOADING_STATUS } from 'store/commonTypes'
import { Errors, logError } from 'services/exceptions/CodedException'
import { RootState } from 'store'

type BalancesState = {
  balances: ChainInfo[]
  status: LOADING_STATUS
  error?: SerializedError
}

const initialState: BalancesState = {
  balances: [],
  status: LOADING_STATUS.IDLE,
  error: undefined,
}

export const balancesSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBalances.pending, (state) => {
      state.status = LOADING_STATUS.PENDING
      state.error = undefined
    })

    builder.addCase(fetchBalances.fulfilled, (state, { payload }) => {
      state.status = LOADING_STATUS.SUCCEEDED
      state.balances = payload
    })

    builder.addCase(fetchBalances.rejected, (state, { error }) => {
      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._904, error.message)
    })
  },
})

export const fetchBalances = createAsyncThunk(
  `${balancesSlice.name}/fetchBalances`,
  ({ chainId, address }: { chainId: string; address: string }) => {
    return getBalances(GATEWAY_URL, chainId, address)
  },
)

export const selectBalances = (state: RootState): BalancesState['balances'] => {
  return state[balancesSlice.name].balances
}
