import { getChainsConfig, type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createAsyncThunk, createSelector, createSlice, SerializedError } from '@reduxjs/toolkit'

import { GATEWAY_URL } from 'config/constants'
import { LOADING_STATUS } from 'store/commonTypes'
import { Errors, logError } from 'services/exceptions/CodedException'
import { RootState } from 'store'

type ChainsState = {
  chains: ChainInfo[]
  status: LOADING_STATUS
  error?: SerializedError
}

const initialState: ChainsState = {
  chains: [],
  status: LOADING_STATUS.IDLE,
  error: undefined,
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
      state.chains = payload
    })

    builder.addCase(fetchChains.rejected, (state, { error }) => {
      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._904, error.message)
    })
  },
})

export const fetchChains = createAsyncThunk(`${chainsSlice.name}/fetchSafeInfo`, async () => {
  return (await getChainsConfig(GATEWAY_URL)).results
})

export const selectChains = (state: RootState): ChainsState['chains'] => {
  return state[chainsSlice.name].chains
}

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    return chains.find((item: ChainInfo) => item.chainId === chainId)
  },
)
