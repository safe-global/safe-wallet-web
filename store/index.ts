import { configureStore, combineReducers, type ThunkAction, type Action } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { chainsSlice } from './chainsSlice'
import { safeInfoSlice } from './safeInfoSlice'
import { balancesSlice } from './balancesSlice'
import { collectiblesSlice } from './collectiblesSlice'
import { currencySlice } from './currencySlice'
import { txHistorySlice } from './txHistorySlice'
import { txQueueSlice } from './txQueueSlice'
import { addressBookSlice } from './addressBookSlice'

const rootReducer = combineReducers({
  [chainsSlice.name]: chainsSlice.reducer,
  [safeInfoSlice.name]: safeInfoSlice.reducer,
  [balancesSlice.name]: balancesSlice.reducer,
  [collectiblesSlice.name]: collectiblesSlice.reducer,
  [currencySlice.name]: currencySlice.reducer,
  [txHistorySlice.name]: txHistorySlice.reducer,
  [txQueueSlice.name]: txQueueSlice.reducer,
  [addressBookSlice.name]: addressBookSlice.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
})

type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
