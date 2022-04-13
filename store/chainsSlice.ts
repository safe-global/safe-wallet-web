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

type ChainsState = Pick<ChainListResponse, "results"> & { loading: boolean };

const initialState: ChainsState = {
  results: [],
  loading: false,
};

export const chainsSlice = createSlice({
  name: "chains",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getChains.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getChains.fulfilled,
        (_, action: PayloadAction<ChainListResponse>) => ({
          results: action.payload.results,
          loading: false,
        })
      )
      .addCase(getChains.rejected, (state) => {
        state.loading = false;
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
