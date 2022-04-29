import { AddressEx, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { Loadable } from './common'

interface SafeInfoState extends Loadable {
  safe?: SafeInfo
}

const initialState: SafeInfoState = {
  loading: true,
  error: undefined,
  safe: undefined,
}

export const safeInfoSlice = createSlice({
  name: 'safeInfo',
  initialState,
  reducers: {
    setSafeInfo: (state, action: PayloadAction<SafeInfoState>) => {
      return action.payload
    },
  },
})

export const { setSafeInfo } = safeInfoSlice.actions

export const selectSafeInfo = (state: RootState): SafeInfoState => {
  return state[safeInfoSlice.name]
}
