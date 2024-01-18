import { type RootState } from '@/store/index'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PredictedSafeProps } from '@safe-global/protocol-kit/dist/src/types'

type UndeployedSafeSlice = { [address: string]: PredictedSafeProps }

type UndeployedSafeState = { [chainId: string]: UndeployedSafeSlice }

const initialState: UndeployedSafeState = {}

export const undeployedSafeSlice = createSlice({
  name: 'undeployedSafe',
  initialState,
  reducers: {
    setUndeployedSafe: (_, action: PayloadAction<UndeployedSafeState>): UndeployedSafeState => {
      return action.payload
    },

    addUndeployedSafe: (
      state,
      action: PayloadAction<{ chainId: string; address: string; safeProps: PredictedSafeProps }>,
    ) => {
      const { chainId, address, safeProps } = action.payload

      if (!state[chainId]) {
        state[chainId] = {}
      }

      state[chainId][address] = safeProps
    },

    removeUndeployedSafe: (state, action: PayloadAction<{ chainId: string; address: string }>) => {
      const { chainId, address } = action.payload
      if (!state[chainId]) return state

      delete state[chainId][address]

      if (Object.keys(state[chainId]).length > 0) return state

      delete state[chainId]
    },
  },
})

export const { setUndeployedSafe, removeUndeployedSafe, addUndeployedSafe } = undeployedSafeSlice.actions

export const selectUndeployedSafes = (state: RootState): UndeployedSafeState => {
  return state[undeployedSafeSlice.name]
}

export const selectUndeployedSafe = createSelector(
  [selectUndeployedSafes, (_, chainId: string, address: string) => [chainId, address]],
  (undeployedSafes, [chainId, address]): PredictedSafeProps | undefined => {
    return undeployedSafes[chainId]?.[address]
  },
)
