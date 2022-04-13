import { AddressEx, SafeInfo } from "@gnosis.pm/safe-react-gateway-sdk";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { RootState } from ".";

const emptyAddressEx: AddressEx = {
  value: "",
  name: null,
  logoUri: null,
};

const initialState: SafeInfo = {
  address: emptyAddressEx,
  chainId: "",
  nonce: 0,
  threshold: 0,
  owners: [],
  implementation: emptyAddressEx,
  modules: [],
  guard: emptyAddressEx,
  fallbackHandler: emptyAddressEx,
  version: "",
  collectiblesTag: "",
  txQueuedTag: "",
  txHistoryTag: "",
};

export const safeInfoSlice = createSlice({
  name: "safeInfo",
  initialState,
  reducers: {
    setSafeInfo: (_, action: PayloadAction<SafeInfo>) => {
      return action.payload;
    },
  },
});

export const { setSafeInfo } = safeInfoSlice.actions;

export const safeInfoState = (state: RootState): SafeInfo => {
  return state[safeInfoSlice.name];
};
