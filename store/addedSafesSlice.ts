import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '.'
import { setSafeInfo, type SetSafeInfoPayload } from '@/store/safeInfoSlice'

type AddedSafesState = {
  [chainId: string]: {
    [safeAddress: string]: SafeInfo
  }
}

const initialState: AddedSafesState = {}

export const addedSafesSlice = createSlice({
  name: 'addedSafes',
  initialState,
  reducers: {
    addOrUpdateSafe: (state, { payload }: PayloadAction<{ safe: SafeInfo }>) => {
      const { chainId, address } = payload.safe

      state[chainId] ??= {}
      state[chainId][address.value] = payload.safe
    },
    removeSafe: (state, { payload }: PayloadAction<{ chainId: string; address: string }>) => {
      const { chainId, address } = payload

      delete state[chainId][address]

      if (Object.keys(state[chainId]).length === 0) {
        delete state[chainId]
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(setSafeInfo.type, (state, { payload }: SetSafeInfoPayload) => {
      if (!payload.safe) {
        return
      }

      const { chainId, address } = payload.safe
      const isAddedSafe = state[chainId]?.[address.value]

      if (isAddedSafe) {
        addedSafesSlice.caseReducers.addOrUpdateSafe(state, {
          type: addOrUpdateSafe.type,
          payload: { safe: payload.safe },
        })
      }
    })
  },
})

export const { addOrUpdateSafe, removeSafe } = addedSafesSlice.actions

export const selectAllAddedSafes = (state: RootState): AddedSafesState => {
  return state[addedSafesSlice.name]
}

export const selectAddedSafes = createSelector(
  [selectAllAddedSafes, (_: RootState, chainId: string) => chainId],
  (allAddedSafes, chainId) => {
    return allAddedSafes[chainId]
  },
)
