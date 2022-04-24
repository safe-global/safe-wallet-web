import { AddressEx, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

const emptyAddressEx: AddressEx = {
  value: '',
  name: null,
  logoUri: null,
}

type SafeInfoState = {
  safe?: SafeInfo
  loading: boolean
  error?: Error
}

const initialState: SafeInfoState = {
  safe: undefined,
  loading: true,
  error: undefined,
}

export const safeInfoSlice = createSlice({
  name: 'safeInfo',
  initialState,
  reducers: {
    setSafeInfo: (state, action: PayloadAction<SafeInfo | undefined>) => {
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
