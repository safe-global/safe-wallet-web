import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import { Loadable } from './common'

interface CollectiblesState extends Loadable {
  collectibles: SafeCollectibleResponse[]
}

const initialState: CollectiblesState = {
  loading: true,
  error: undefined,
  collectibles: [],
}

export const collectiblesSlice = createSlice({
  name: 'collectibles',
  initialState,
  reducers: {
    setCollectibles: (_, action: PayloadAction<CollectiblesState>): CollectiblesState => {
      return action.payload
    },
  },
})

export const { setCollectibles } = collectiblesSlice.actions

export const selectCollectibles = (state: RootState): CollectiblesState => {
  return state[collectiblesSlice.name]
}
