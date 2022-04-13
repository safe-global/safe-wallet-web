import {
  getChainsConfig,
  type ChainListResponse,
} from "@gnosis.pm/safe-react-gateway-sdk";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { GATEWAY_URL } from "config/constants";
import { selectSafeInfo } from "./safeInfoSlice";
import type { RootState } from "store";

export const enum STATUS {
  NONE = "NONE",
  PENDING = "PENDING",
  FULFILLED = "FULFILLED",
  REJECTED = "REJECTED",
}

type ChainsState = Pick<ChainListResponse, "results"> & {
  status: STATUS;
};

const initialState: ChainsState = {
  results: [],
  status: STATUS.NONE,
};

export const chainsSlice = createSlice({
  name: "chains",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getChains.pending, (state) => {
        state.status = STATUS.PENDING;
      })
      .addCase(
        getChains.fulfilled,
        (_, action: PayloadAction<ChainListResponse>) => ({
          results: action.payload.results,
          status: STATUS.FULFILLED,
        })
      )
      .addCase(getChains.rejected, (state) => {
        state.status = STATUS.REJECTED;
      });
  },
});

export const getChains = createAsyncThunk(
  `${chainsSlice.name}/init`,
  async () => {
    return await getChainsConfig(GATEWAY_URL);
  }
);

export const selectChainsState = (state: RootState): ChainsState => {
  return state[chainsSlice.name];
};

export const selectChain = createSelector(
  selectChainsState,
  selectSafeInfo,
  ({ results }, { chainId }): ChainsState["results"][number] | undefined => {
    return results.find((chain) => chain.chainId === chainId);
  }
);
