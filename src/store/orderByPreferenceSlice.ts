import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

export enum OrderByOption {
  NAME = 'name',
  LAST_VISITED = 'lastVisited',
}

export type OrderByPreferenceState = { orderBy: OrderByOption }

const initialState: OrderByPreferenceState = { orderBy: OrderByOption.LAST_VISITED }

export const orderByPreferenceSlice = createSlice({
  name: 'orderByPreference',
  initialState,
  reducers: {
    setOrderByPreference: (state, { payload }: PayloadAction<{ orderBy: OrderByOption }>) => {
      const { orderBy } = payload
      state.orderBy = orderBy
    },
  },
})

export const { setOrderByPreference } = orderByPreferenceSlice.actions

export const selectOrderByPreference = (state: RootState): OrderByPreferenceState => {
  return state[orderByPreferenceSlice.name] || initialState
}
