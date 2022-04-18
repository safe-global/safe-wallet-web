import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type CollectiblesState = SafeCollectibleResponse[]

const initialState: CollectiblesState = []

export const collectiblesSlice = createSlice({
  name: 'collectibles',
  initialState,
  reducers: {
    setCollectibles: (_, action: PayloadAction<CollectiblesState | undefined>): CollectiblesState => {
      return action.payload || initialState
    },
  },
})

export const { setCollectibles } = collectiblesSlice.actions

export const selectCollectibles = (state: RootState): CollectiblesState => {
  return state[collectiblesSlice.name]
}
