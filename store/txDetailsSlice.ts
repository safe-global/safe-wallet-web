import type { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type TxDetailsState = {
  [txId: string]: TransactionDetails
}

const initialState: TxDetailsState = {}

export const txDetailsSlice = createSlice({
  name: 'txDetails',
  initialState,
  reducers: {
    setTxDetails: (state, action: PayloadAction<TransactionDetails>) => {
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
      state[action.payload.id] = action.payload
    },
  },
})

export const { setTxDetails } = txDetailsSlice.actions

const selectTxDetailsState = (state: RootState): TxDetailsState => {
  return state[txDetailsSlice.name]
}

export const selectTxDetails = createSelector(
  [selectTxDetailsState, (_: RootState, txId: string) => txId],
  (txDetails, txId) => {
    return txDetails?.[txId]
  },
)
