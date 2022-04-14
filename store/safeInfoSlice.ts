import { AddressEx, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

const emptyAddressEx: AddressEx = {
  value: '',
  name: null,
  logoUri: null,
}

type SafeInfoState = {
  safe: SafeInfo
  loading: boolean
  error?: Error
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
  loading: true,
}

export const safeInfoSlice = createSlice({
  name: 'safeInfo',
  initialState,
  reducers: {
    setSafeInfo: (state, action: PayloadAction<SafeInfo>) => {
      return { ...state, safe: action.payload }
    },
    setSafeError: (state, action: PayloadAction<Error>) => {
      return { ...state, error: action.payload }
    },
    setSafeLoading: (state, action: PayloadAction<boolean>) => {
      return { ...state, loading: action.payload }
    },
  },
})

export const { setSafeInfo, setSafeError, setSafeLoading } = safeInfoSlice.actions

export const selectSafeInfo = (state: RootState): SafeInfoState => {
  return state[safeInfoSlice.name]
}
