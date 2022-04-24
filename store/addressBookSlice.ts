import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { selectSafeInfo } from './safeInfoSlice'

type AddressBook = { [address: string]: string }

export type AddressBookState = Record<
  string, // chainId
  AddressBook
>

const initialState: AddressBookState = {}

export const addressBookSlice = createSlice({
  name: 'addressBook',
  initialState,
  reducers: {
    setAddressBook: (_, action: PayloadAction<AddressBookState>): AddressBookState => {
      return action.payload
    },

    upsertAddressBookEntry: (
      state,
      action: PayloadAction<{ chainId: string; address: string; name: string }>,
    ): AddressBookState => {
      const { chainId, address, name } = action.payload
      if (!state[chainId]) state[chainId] = {}
      state[chainId][address] = name
      return state
    },

    removeAddressBookEntry: (state, action: PayloadAction<{ chainId: string; address: string }>): AddressBookState => {
      const { chainId, address } = action.payload
      if (!state[chainId]) return state
      delete state[chainId][address]
      return state
    },
  },
})

export const { setAddressBook, upsertAddressBookEntry, removeAddressBookEntry } = addressBookSlice.actions

export const selectAllAddressBooks = (state: RootState): AddressBookState => {
  return state[addressBookSlice.name]
}

export const selectAddressBook = createSelector(
  [selectAllAddressBooks, selectSafeInfo],
  (allAddressBooks, safeInfo): AddressBook => {
    const chainId = safeInfo.safe?.chainId
    return chainId ? allAddressBooks[chainId] || {} : {}
  },
)
