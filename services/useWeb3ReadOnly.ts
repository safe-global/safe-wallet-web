import {useEffect} from "react";
import {getRpcServiceUrl, setWeb3ReadOnly} from "utils/web3";
import Web3 from "web3";
import {useAppSelector} from "store";
import useSafeAddress from "services/useSafeAddress";
import {selectChainById} from "store/chainsSlice";

export const useWeb3ReadOnly = () => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

  useEffect(() => {
    if (!chainConfig) return

    const provider = new Web3.providers.HttpProvider(getRpcServiceUrl(chainConfig.rpcUri))
    setWeb3ReadOnly(provider)
  }, [chainConfig])
}