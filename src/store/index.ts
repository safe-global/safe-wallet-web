import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { isProduction } from '../config/constants'
import { reduxStorage } from './storage'
import txHistory from './txHistorySlice'
import { gatewayApi } from './gateway'

const persistConfig = {
  key: 'root',
  version: 1,
  storage: reduxStorage,
  blacklist: [gatewayApi.reducerPath],
}
const rootReducer = combineReducers({
  txHistory,
  [gatewayApi.reducerPath]: gatewayApi.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  devTools: isProduction,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(gatewayApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
