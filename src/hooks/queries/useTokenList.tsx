import * as React from 'react'
import useChainId from '../useChainId'
import { useGetTokenList } from './useGetTokenList'
import useGetAllTokens from './useGetAllTokens'
import tokenLists from '@/config/tokenLists'
import type { IToken, ITokenLists } from '@/components/safe-apps/types'
import type { SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'

export const blacklist = ['0x5729cb3716a315d0bde3b5e489163bf8b9659436', '0x6abaedab0ba368f1df52d857f24154cc76c8c972']

export function useTokenList(balances: SafeBalanceResponse) {
  const chainId = useChainId()

  const { data: tokens, isLoading, error } = useGetAllTokens()

  const { data: tokenList, isLoading: tokenListLoading } = useGetTokenList()

  const data: ITokenLists[] | null = React.useMemo(() => {
    if (tokens) {
      const verifiedLists =
        (!tokenListLoading && tokenList ? tokenList : chainId ? tokenLists[Number(chainId)] : null) ?? null

      if (!verifiedLists) return null
      console.log('balances', balances)

      const filteredTokens = balances.items
        .map((balance) => {
          const token = tokens.find(
            (token) => token.tokenAddress.toLowerCase() == balance.tokenInfo.address.toLowerCase(),
          )

          return token
            ? {
                ...token,
                balance: balance.balance,
              }
            : undefined
        })
        .filter((token) => !!token) as IToken[]

      return filteredTokens.map((token) => {
        // always convert addresses to lowercase
        const address = token.tokenAddress.toLowerCase()
        const verifiedToken = verifiedLists[address]
        return {
          ...token,
          logoURI:
            verifiedToken?.logoURI ??
            'https://raw.githubusercontent.com/LlamaPay/interface/main/public/empty-token.webp',
          isVerified: verifiedToken ? true : false,
          name: verifiedToken?.name ?? token.name,
        }
      })
    } else return null
  }, [chainId, tokens, tokenListLoading, tokenList])

  return { data, isLoading: isLoading || tokenListLoading, error }
}
