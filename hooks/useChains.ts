import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { gatewayApi } from '@/store/gatewayApi'
import useChainId from '@/hooks/useChainId'

const useChains = () => {
  return gatewayApi.useGetChainsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
  })
}

export const useChainById = (chainId: string): ChainInfo | undefined => {
  const { data } = useChains()
  return data?.results?.find((chain) => chain.chainId === chainId)
}

export const useCurrentChain = (): ChainInfo | undefined => {
  const chainId = useChainId()
  return useChainById(chainId)
}

export default useChains
