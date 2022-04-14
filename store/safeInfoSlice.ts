import { createAsyncThunk, createSlice, SerializedError } from '@reduxjs/toolkit'
import { AddressEx, getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { GATEWAY_URL } from 'config/constants'
import { LOADING_STATUS } from 'store/commonTypes'
import { Errors, logError } from 'services/exceptions/CodedException'
import type { RootState } from 'store'

const emptyAddressEx: AddressEx = {
  value: '',
  name: null,
  logoUri: null,
}

type SafeInfoState = {
  safe: SafeInfo
  status: LOADING_STATUS
  error?: SerializedError
}

const initialState: SafeInfoState = {
  safe: {
    address: emptyAddressEx,
    chainId: '',
    nonce: 0,
    threshold: 0,
    owners: [],
    implementation: emptyAddressEx,
    modules: [],
    guard: emptyAddressEx,
    fallbackHandler: emptyAddressEx,
    version: '',
    collectiblesTag: '',
    txQueuedTag: '',
    txHistoryTag: '',
  },
  status: LOADING_STATUS.IDLE,
  error: undefined,
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
    builder.addCase(fetchSafeInfo.fulfilled, (state, { meta, payload }) => {
      const { chainId, address } = meta.arg

      const isRaceCondition = address !== payload.address.value || chainId !== payload.chainId
      if (isRaceCondition) {
        fetchSafeInfo(meta.arg)
        return state
      }

      state.status = LOADING_STATUS.SUCCEEDED
      state.safe = payload
    })
    builder.addCase(fetchSafeInfo.rejected, (state, { error }) => {
      state.status = LOADING_STATUS.FAILED
      state.error = error

      logError(Errors._605, error.message)
    })
  },
})

export const fetchSafeInfo = createAsyncThunk(
  `${safeInfoSlice.name}/fetchSafeInfo`,
  async ({ chainId, address }: { chainId: string; address: string }) => {
    return await getSafeInfo(GATEWAY_URL, chainId, address)
  },
)

export const selectSafeInfo = (state: RootState): SafeInfoState => {
  return state[safeInfoSlice.name]
}
