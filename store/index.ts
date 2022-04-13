import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { safeInfoSlice } from "./safeInfoSlice";

const rootReducer = combineReducers({
  [safeInfoSlice.name]: safeInfoSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
