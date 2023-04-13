import {
  configureStore,
  combineReducers,
  type ThunkAction,
  type PreloadedState,
  type AnyAction,
} from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import merge from 'lodash/merge'
import { IS_PRODUCTION } from '@/config/constants'
import { createStoreHydrator, HYDRATE_ACTION } from './storeHydrator'
import { chainsSlice } from './chainsSlice'
import { safeInfoSlice } from './safeInfoSlice'
import { balancesSlice } from './balancesSlice'
import { sessionSlice } from './sessionSlice'
import { txHistorySlice, txHistoryMiddleware } from './txHistorySlice'
import { txQueueSlice, txQueueMiddleware } from './txQueueSlice'
import { addressBookSlice } from './addressBookSlice'
import { notificationsSlice } from './notificationsSlice'
import { getPreloadedState, persistState } from './persistStore'
import { pendingTxsSlice } from './pendingTxsSlice'
import { addedSafesMiddleware, addedSafesSlice } from './addedSafesSlice'
import { settingsSlice } from './settingsSlice'
import { cookiesSlice } from './cookiesSlice'
import { popupSlice } from './popupSlice'
import { spendingLimitSlice } from './spendingLimitsSlice'
import { safeAppsSlice } from './safeAppsSlice'
import { safeMessagesMiddleware, safeMessagesSlice } from './safeMessagesSlice'
import { pendingSafeMessagesSlice } from './pendingSafeMessagesSlice'

const rootReducer = combineReducers({
  [chainsSlice.name]: chainsSlice.reducer,
  [safeInfoSlice.name]: safeInfoSlice.reducer,
  [balancesSlice.name]: balancesSlice.reducer,
  [sessionSlice.name]: sessionSlice.reducer,
  [txHistorySlice.name]: txHistorySlice.reducer,
  [txQueueSlice.name]: txQueueSlice.reducer,
  [addressBookSlice.name]: addressBookSlice.reducer,
  [notificationsSlice.name]: notificationsSlice.reducer,
  [pendingTxsSlice.name]: pendingTxsSlice.reducer,
  [addedSafesSlice.name]: addedSafesSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
  [cookiesSlice.name]: cookiesSlice.reducer,
  [popupSlice.name]: popupSlice.reducer,
  [spendingLimitSlice.name]: spendingLimitSlice.reducer,
  [safeAppsSlice.name]: safeAppsSlice.reducer,
  [safeMessagesSlice.name]: safeMessagesSlice.reducer,
  [pendingSafeMessagesSlice.name]: pendingSafeMessagesSlice.reducer,
})

const persistedSlices: (keyof PreloadedState<RootState>)[] = [
  sessionSlice.name,
  addressBookSlice.name,
  pendingTxsSlice.name,
  addedSafesSlice.name,
  settingsSlice.name,
  cookiesSlice.name,
  safeAppsSlice.name,
  pendingSafeMessagesSlice.name,
]

const middleware = [
  persistState(persistedSlices),
  txHistoryMiddleware,
  txQueueMiddleware,
  addedSafesMiddleware,
  safeMessagesMiddleware,
]

export const getPersistedState = () => {
  return getPreloadedState(persistedSlices)
}

export const _hydrationReducer: typeof rootReducer = (state, action) => {
  if (action.type === HYDRATE_ACTION) {
    /**
     * When changing the schema of a Redux slice, previously stored data in LS might become incompatible.
     * To avoid this, we should always migrate the data on a case-by-case basis in the corresponding slice.
     * However, as a catch-all measure, we attempt to merge the stored data with the initial Redux state,
     * so that any newly added properties in the initial state are preserved, and existing properties are taken from the LS.
     *
     * @see https://lodash.com/docs/4.17.15#merge
     */

    return merge({}, state, action.payload)
  }
  return rootReducer(state, action)
}

const makeStore = (initialState?: Record<string, any>) => {
  return configureStore({
    reducer: _hydrationReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(middleware),
    devTools: !IS_PRODUCTION,
    preloadedState: initialState,
  })
}

export const StoreHydrator = createStoreHydrator(makeStore)

export type AppDispatch = ReturnType<typeof makeStore>['dispatch']
export type RootState = ReturnType<typeof _hydrationReducer>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
