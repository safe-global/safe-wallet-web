import type { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type TxDetailsState = { [chainId: string]: { [txId: string]: TransactionDetails } }

const initialState: TxDetailsState = {}

export const txDetailsSlice = createSlice({
  name: 'txDetails',
  initialState,
  reducers: {
    setTxDetails: (state, action: PayloadAction<{ chainId: string; txDetails: TransactionDetails }>) => {
      const { chainId, txDetails } = action.payload

      state[chainId] ??= {}
      // @ts-ignore: Type instantiation is excessively deep and possibly infinite.
      state[chainId][txDetails.txId] = txDetails
    },
  },
})

export const { setTxDetails } = txDetailsSlice.actions

const selectTxDetails = (state: RootState): TxDetailsState => {
  return state[txDetailsSlice.name]
}

export const selectTxDetailsById = createSelector(
  [selectTxDetails, (_: RootState, details: { chainId: string; txId: string }) => details],
  (txDetails, { chainId, txId }) => {
    return txDetails?.[chainId]?.[txId]
  },
)
