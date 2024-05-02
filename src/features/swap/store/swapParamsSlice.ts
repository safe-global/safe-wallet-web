import type { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit',
}

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
    setSwapParams: (_, action: PayloadAction<SwapState>) => action.payload,
  },
})

export const { setSwapParams } = swapParamsSlice.actions
export const selectSwapParams = (state: RootState): SwapState => state[swapParamsSlice.name]
