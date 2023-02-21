import type { IToken } from '@/components/safe-apps/types'
import { networkDetails } from '@/utils/networkDetails'
import { getAddress } from 'ethers/lib/utils'
import * as React from 'react'

import { useGetAllTokensQuery } from 'services/generated/graphql'
import useChainId from '../useChainId'
import { useCurrentChain } from '../useChains'

export const defaultSubgraphEndpoint = 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avax-mainnet'

const useGetAllTokens = () => {
  // get subgraph endpoint
  const chainId = useChainId()
  const chain = useCurrentChain()
  const endpoint = chainId ? networkDetails[Number(chainId)]?.subgraphEndpoint : defaultSubgraphEndpoint

  const {
    data = null,
    isLoading,
    error,
  } = useGetAllTokensQuery(
    { endpoint },
    { network: chain?.chainName || '' },
    {
      refetchInterval: 30000,
    },
  )

  // format the data in memo, instead of react query's select as graphql trigger rerenders multiple times when using it
  const tokens: IToken[] | null = React.useMemo(() => {
    if (data?.tokens) {
      const result = data?.tokens.map((c) => ({
        tokenAddress: getAddress(c.address),
        llamaContractAddress: getAddress(c.contract?.id),
        name: c.name,
        symbol: c.symbol,
        decimals: c.decimals,
      }))
      return result.filter((c) => c.tokenAddress.toLowerCase() !== '0x0000000000000000000000000000000000001010')
    } else return null
  }, [data])

  return React.useMemo(() => ({ data: tokens, isLoading, error }), [tokens, isLoading, error])
}

export default useGetAllTokens
