import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import type { RootState } from 'store'

type ChainsState = ChainInfo[]

const initialState: ChainsState = []

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
    return chains.find((item: ChainInfo) => item.chainId === chainId)
  },
)
