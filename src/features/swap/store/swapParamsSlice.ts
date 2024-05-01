import type { RootState } from '@/store'
import { createSlice } from '@reduxjs/toolkit'

export type SwapState = {
  buyToken: string
  sellToken: string
  // orderKind: string
}

const initialState: SwapState = {
  buyToken: 'DAI',
  sellToken: 'USDC',
}

export const swapParamsSlice = createSlice({
  name: 'swapParams',
  initialState,
  reducers: {
    setSwapParams: (state, action) => {
      const { buyToken, sellToken } = action.payload
      return {
        buyToken: buyToken?.symbol ? buyToken?.symbol : state.buyToken,
        sellToken: sellToken?.symbol ? sellToken?.symbol : state.sellToken,
      }
    },
  },
})

export const { setSwapParams } = swapParamsSlice.actions
export const selectSwapParams = (state: RootState): SwapState => state[swapParamsSlice.name]
