import { type ChainInfo } from "@gnosis.pm/safe-react-gateway-sdk";
import { createSelector,  createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "store";

type ChainsState = {
  chains: ChainInfo[]
}

const initialState: ChainsState = {
  chains: [],
};

export const chainsSlice = createSlice({
  name: "chains",
  initialState,
  setChains: (_: RootState, action: PayloadAction<ChainsState>): ChainsState => {
    return action.payload;
  },
});

export const selectChains = (state: RootState): ChainsState => {
  return state[chainsSlice.name].chains;
};

export const selectChainById = createSelector(
  [
    selectChains,
    (_: RootState, chainId: string) => chainId,
  ],

  (chains: ChainInfo[], chainId: string): ChainInfo | undefined => {
    return chains.find((item) => item.chainId === chainId);
  }
);

export const { setChains } = chainsSlice.actions;
