import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('chains', [] as ChainInfo[])

export const chainsSlice = slice
export const selectChains = selector

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    return chains.data.find((item: ChainInfo) => item.chainId === chainId)
  },
)
