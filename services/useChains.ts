import {
  ChainInfo,
  getChainsConfig,
  type ChainListResponse,
} from "@gnosis.pm/safe-react-gateway-sdk";
import { GATEWAY_URL } from "config/constants";
import { useEffect } from "react";
import { useAppDispatch } from "store";
import { setChains } from "store/chainsSlice";
import useAsync from "./useAsync";

const getChainConfigs = (): Promise<ChainListResponse> => {
  return getChainsConfig(GATEWAY_URL);
}

const useChains = (): { chains: ChainInfo[], error?: Error, loading: boolean } => {
  const dispatch = useAppDispatch()
  const [ data, error, loading ] = useAsync<ChainListResponse>(getChainConfigs)
  const chains = data?.results || []

  useEffect(() => {
    dispatch(setChains(chains))
  }, [chains, dispatch])

  return { chains, error, loading }
}

export default useChains
