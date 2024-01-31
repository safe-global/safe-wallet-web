import { type RootState } from '@/store'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'

type UndeployedSafeSlice = { [address: string]: PredictedSafeProps }

type UndeployedSafeState = { [chainId: string]: UndeployedSafeSlice }

const initialState: UndeployedSafeState = {}

export const undeployedSafeSlice = createSlice({
  name: 'undeployedSafe',
  initialState,
  reducers: {
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

export const { removeUndeployedSafe, addUndeployedSafe } = undeployedSafeSlice.actions

export const selectUndeployedSafes = (state: RootState): UndeployedSafeState => {
  return state[undeployedSafeSlice.name]
}

export const selectUndeployedSafe = createSelector(
  [selectUndeployedSafes, (_, chainId: string, address: string) => [chainId, address]],
  (undeployedSafes, [chainId, address]): PredictedSafeProps | undefined => {
    return undeployedSafes[chainId]?.[address]
  },
)
