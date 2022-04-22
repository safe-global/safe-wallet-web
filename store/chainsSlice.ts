import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

type ChainsState = {
  configs: ChainInfo[]
  error?: Error
  loading: boolean
}

const initialState: ChainsState = {
  configs: [],
  error: undefined,
  loading: true,
}

export const chainsSlice = createSlice({
  name: 'chains',
  initialState,
  reducers: {
    setChains: (_, action: PayloadAction<ChainsState>): ChainsState => {
      return action.payload
    },
  },
})

export const { setChains } = chainsSlice.actions

export const selectChains = (state: RootState): ChainsState => {
  return state.chains
}

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    return chains.configs.find((item: ChainInfo) => item.chainId === chainId)
  },
)
