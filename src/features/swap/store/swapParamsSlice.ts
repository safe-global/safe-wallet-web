import type { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { TradeType } from '@cowprotocol/widget-lib'
import type { UiOrderType } from '@cowprotocol/types'
import { UiOrderTypeToOrderType } from '@/features/swap/helpers/utils'

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
    setSwapParams: (
      _,
      action: PayloadAction<{
        tradeType: UiOrderType
      }>,
    ) => {
      return {
        tradeType: UiOrderTypeToOrderType(action.payload.tradeType),
      }
    },
  },
})

export const { setSwapParams } = swapParamsSlice.actions
export const selectSwapParams = (state: RootState): SwapState => state[swapParamsSlice.name]
