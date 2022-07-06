import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { makeLoadableSlice, makeSliceSelector } from './common'

type ChainsData = ChainInfo[]

export const chainsSlice = makeLoadableSlice<ChainsData>('chains', [])
export const selectChains = makeSliceSelector<ChainsData>(chainsSlice)

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    return (chains.data || []).find((item: ChainInfo) => item.chainId === chainId)
  },
)
