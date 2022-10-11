import { type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '.'
import { makeLoadableSlice } from './common'
import { PULSE_CHAIN } from '../config/pulseChain'

const initialState: ChainInfo[] = []

const { slice, selector } = makeLoadableSlice('chains', initialState)

export const chainsSlice = slice
export const selectChains = selector

export const selectChainById = createSelector(
  [selectChains, (_: RootState, chainId: string) => chainId],
  (chains, chainId) => {
    return PULSE_CHAIN.find((item: ChainInfo) => item.chainId === chainId)
  },
)
