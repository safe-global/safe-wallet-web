import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['balances'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetBalances: build.query<V1GetBalancesApiResponse, V1GetBalancesApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains/${queryArg.chainId}/safes/${queryArg.safeAddress}/balances/${queryArg.fiatCode}`,
          params: {
            trusted: queryArg.trusted,
            exclude_spam: queryArg.excludeSpam,
          },
        }),
        providesTags: ['balances'],
      }),
      v1GetSupportedFiatCodes: build.query<V1GetSupportedFiatCodesApiResponse, V1GetSupportedFiatCodesApiArg>({
        query: () => ({ url: `/v1/balances/supported-fiat-codes` }),
        providesTags: ['balances'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetBalancesApiResponse = /** status 200  */ Balances
export type V1GetBalancesApiArg = {
  chainId: string
  safeAddress: string
  fiatCode: string
  trusted?: boolean
  excludeSpam?: boolean
}
export type V1GetSupportedFiatCodesApiResponse = unknown
export type V1GetSupportedFiatCodesApiArg = void
export type Token = {
  address: string
  decimals?: number | null
  logoUri: string
  name: string
  symbol: string
  type: 'ERC721' | 'ERC20' | 'NATIVE_TOKEN' | 'UNKNOWN'
}
export type Balance = {
  balance: string
  fiatBalance: string
  fiatConversion: string
  tokenInfo: Token
}
export type Balances = {
  fiatTotal: string
  items: Balance[]
}
export const { useV1GetBalancesQuery, useV1GetSupportedFiatCodesQuery } = injectedRtkApi
