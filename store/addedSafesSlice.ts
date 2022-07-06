import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { AddressEx, SafeBalanceResponse, SafeInfo, TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '.'
import { gatewayApi } from '@/store/gatewayApi'
import { formatDecimals } from '@/utils/formatters'

export type AddedSafesOnChain = {
  [safeAddress: string]: {
    owners: AddressEx[]
    threshold: number
    ethBalance?: string
  }
}

export type AddedSafesState = {
  [chainId: string]: AddedSafesOnChain
}

const initialState: AddedSafesState = {}

const isAddedSafe = (state: AddedSafesState, chainId: string, safeAddress: string) => {
  return !!state[chainId]?.[safeAddress]
}

export const addedSafesSlice = createSlice({
  name: 'addedSafes',
  initialState,
  reducers: {
    addOrUpdateSafe: (state, { payload }: PayloadAction<{ safe: SafeInfo }>) => {
      const { chainId, address, owners, threshold } = payload.safe

      state[chainId] ??= {}
      state[chainId][address.value] = {
        // Keep balance
        ...(state[chainId][address.value] ?? {}),
        owners,
        threshold,
      }
    },
    updateAddedSafeBalance: (
      state,
      { payload }: PayloadAction<{ chainId: string; address: string; balances: SafeBalanceResponse }>,
    ) => {
      const { chainId, address, balances } = payload

      if (!isAddedSafe(state, chainId, address)) {
        return
      }

      for (const item of balances.items) {
        if (item.tokenInfo.type !== TokenType.NATIVE_TOKEN) {
          continue
        }

        state[chainId][address].ethBalance = formatDecimals(item.balance, item.tokenInfo.decimals)

        return
      }
    },
    removeSafe: (state, { payload }: PayloadAction<{ chainId: string; address: string }>) => {
      const { chainId, address } = payload

      delete state[chainId]?.[address]

      if (Object.keys(state[chainId]).length === 0) {
        delete state[chainId]
      }
    },
  },
  extraReducers(builder) {
    builder.addMatcher(gatewayApi.endpoints.getSafeInfo.matchFulfilled, (state, { payload }) => {
      addedSafesSlice.caseReducers.addOrUpdateSafe(state, {
        type: addOrUpdateSafe.type,
        payload: { safe: payload },
      })
    })
    builder.addMatcher(gatewayApi.endpoints.getBalances.matchFulfilled, (state, { payload, meta }) => {
      const { chainId, address } = meta.arg.originalArgs

      addedSafesSlice.caseReducers.updateAddedSafeBalance(state, {
        type: updateAddedSafeBalance.type,
        payload: { chainId, address, balances: payload },
      })
    })
  },
})

export const { addOrUpdateSafe, updateAddedSafeBalance, removeSafe } = addedSafesSlice.actions

export const selectAllAddedSafes = (state: RootState): AddedSafesState => {
  return state[addedSafesSlice.name]
}

export const selectAddedSafes = createSelector(
  [selectAllAddedSafes, (_: RootState, chainId: string) => chainId],
  (allAddedSafes, chainId) => {
    return allAddedSafes[chainId]
  },
)
