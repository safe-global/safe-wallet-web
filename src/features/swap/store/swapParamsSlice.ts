import type { RootState } from '@/store'
import { TradeType } from '@cowprotocol/widget-react'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type SwapState = {
  tradeType: TradeType
}

const initialState: SwapState = {
  tradeType: TradeType.SWAP,
}

export const swapParamsSlice = createSlice({
  name: 'swapParams',
  initialState,
  reducers: {
    setSwapParams: (_, action: PayloadAction<SwapState>) => {
      const { tradeType } = action.payload
      return {
        tradeType,
      }
    },
  },
})

export const { setSwapParams } = swapParamsSlice.actions
export const selectSwapParams = (state: RootState): SwapState => state[swapParamsSlice.name]
