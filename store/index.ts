import {
  configureStore,
  combineReducers,
  type ThunkAction,
  type PreloadedState,
  type AnyAction,
} from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { chainsSlice } from './chainsSlice'
import { safeInfoSlice } from './safeInfoSlice'
import { balancesSlice } from './balancesSlice'
import { collectiblesSlice } from './collectiblesSlice'
import { currencySlice } from './currencySlice'
import { txHistorySlice } from './txHistorySlice'
import { txQueueSlice } from './txQueueSlice'
import { addressBookSlice } from './addressBookSlice'
import { notificationsSlice } from './notificationsSlice'
import { getPreloadedState, persistState } from './persistStore'
import { pendingTxsSlice } from './pendingTxsSlice'
import { notificationsMiddleware } from './notificationsMiddleware'
import { addedSafesSlice } from './addedSafesSlice'

const rootReducer = combineReducers({
  [chainsSlice.name]: chainsSlice.reducer,
  [safeInfoSlice.name]: safeInfoSlice.reducer,
  [balancesSlice.name]: balancesSlice.reducer,
  [collectiblesSlice.name]: collectiblesSlice.reducer,
  [currencySlice.name]: currencySlice.reducer,
  [txHistorySlice.name]: txHistorySlice.reducer,
  [txQueueSlice.name]: txQueueSlice.reducer,
  [addressBookSlice.name]: addressBookSlice.reducer,
  [notificationsSlice.name]: notificationsSlice.reducer,
  [pendingTxsSlice.name]: pendingTxsSlice.reducer,
  [addedSafesSlice.name]: addedSafesSlice.reducer,
})

const persistedSlices: (keyof PreloadedState<RootState>)[] = [
  currencySlice.name,
  addressBookSlice.name,
  pendingTxsSlice.name,
  addedSafesSlice.name,
]

const middleware = [persistState(persistedSlices), notificationsMiddleware]

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(middleware),
  preloadedState: getPreloadedState(persistedSlices),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
