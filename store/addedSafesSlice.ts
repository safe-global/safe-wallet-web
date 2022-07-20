import { createSelector, createSlice, Middleware, type PayloadAction } from '@reduxjs/toolkit'
import { AddressEx, SafeBalanceResponse, SafeInfo, TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import type { RootState } from '.'
import { selectSafeInfo, safeInfoSlice } from '@/store/safeInfoSlice'
import { balancesSlice } from './balancesSlice'
import { formatDecimals } from '@/utils/formatters'
import { Loadable } from './common'

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
    migrate: (state, action: PayloadAction<AddedSafesState>) => {
      // Don't migrate if there's data already
      if (Object.keys(state).length > 0) return state
      // Otherwise, migrate
      return action.payload
    },
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
      { payload }: PayloadAction<{ chainId: string; address: string; balances?: SafeBalanceResponse }>,
    ) => {
      const { chainId, address, balances } = payload

      if (!balances?.items || !isAddedSafe(state, chainId, address)) {
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
    builder.addCase(safeInfoSlice.actions.set.type, (state, { payload }: PayloadAction<Loadable<SafeInfo>>) => {
      if (!payload.data) {
        return
      }

      const { chainId, address } = payload.data

      if (isAddedSafe(state, chainId, address.value)) {
        addedSafesSlice.caseReducers.addOrUpdateSafe(state, {
          type: addOrUpdateSafe.type,
          payload: { safe: payload.data },
        })
      }
    })
  },
})

export const { addOrUpdateSafe, updateAddedSafeBalance, removeSafe } = addedSafesSlice.actions

export const selectAllAddedSafes = (state: RootState): AddedSafesState => {
  return state[addedSafesSlice.name]
}

export const selectAddedSafes = createSelector(
  [selectAllAddedSafes, (_: RootState, chainId: string) => chainId],
  (allAddedSafes, chainId): AddedSafesOnChain | undefined => {
    return allAddedSafes[chainId]
  },
)

export const addedSafesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action)

  switch (action.type) {
    case balancesSlice.actions.set.type: {
      const state = store.getState()
      const { data } = selectSafeInfo(state)

      const chainId = data?.chainId
      const address = data?.address.value

      if (!chainId || !address || !action.payload.balances) {
        break
      }

      store.dispatch(updateAddedSafeBalance({ chainId, address, balances: action.payload.balances }))
    }
  }

  return result
}
