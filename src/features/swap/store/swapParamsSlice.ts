import type { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Using TradeType from the cow widget library results in lint errors
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
    setSwapParams: (_, action: PayloadAction<SwapState>) => {
      return {
        tradeType: action.payload.tradeType.toLowerCase() as TradeType,
      }
    },
  },
})

export const { setSwapParams } = swapParamsSlice.actions
export const selectSwapParams = (state: RootState): SwapState => state[swapParamsSlice.name]
