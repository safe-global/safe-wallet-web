import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'
import { mockedAccounts, mockedActiveAccount, mockedActiveSafeInfo } from './constants'
import { Address } from '@/src/types/address'
import { SafeOverview } from '@safe-global/store/gateway/AUTO_GENERATED/safes'

export type SafesSliceItem = {
  SafeInfo: SafeOverview
  chains: string[]
}

export type SafesSlice = Record<Address, SafesSliceItem>

const initialState: SafesSlice = {
  [mockedActiveAccount.address]: {
    SafeInfo: mockedActiveSafeInfo,
    chains: [mockedActiveAccount.chainId],
  },
  [mockedAccounts[1].address.value]: {
    SafeInfo: mockedAccounts[1],
    chains: [mockedAccounts[1].chainId],
  },
}

const activeSafeSlice = createSlice({
  name: 'safes',
  initialState,
  reducers: {
    updateSafeInfo: (state, action: PayloadAction<{ address: Address; item: SafesSliceItem }>) => {
      state[action.payload.address] = action.payload.item
      return state
    },
  },
})

export const { updateSafeInfo } = activeSafeSlice.actions

export const selectAllSafes = (state: RootState) => state.safes
export const selectActiveSafeInfo = createSelector(
  [selectAllSafes, (_state, activeSafeAddress: Address) => activeSafeAddress],
  (safes: SafesSlice, activeSafeAddress: Address) => safes[activeSafeAddress],
)

export default activeSafeSlice.reducer
