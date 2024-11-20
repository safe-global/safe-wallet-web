import { cgwClient as api } from '../cgwClient'
export const addTagTypes = ['chains'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      v1GetChains: build.query<V1GetChainsApiResponse, V1GetChainsApiArg>({
        query: (queryArg) => ({
          url: `/v1/chains`,
          params: {
            cursor: queryArg.cursor,
          },
        }),
        providesTags: ['chains'],
      }),
      v1GetChain: build.query<V1GetChainApiResponse, V1GetChainApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}` }),
        providesTags: ['chains'],
      }),
      v1GetAboutChain: build.query<V1GetAboutChainApiResponse, V1GetAboutChainApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/about` }),
        providesTags: ['chains'],
      }),
      v1GetBackbone: build.query<V1GetBackboneApiResponse, V1GetBackboneApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/about/backbone` }),
        providesTags: ['chains'],
      }),
      v1GetMasterCopies: build.query<V1GetMasterCopiesApiResponse, V1GetMasterCopiesApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/about/master-copies` }),
        providesTags: ['chains'],
      }),
      v1GetIndexingStatus: build.query<V1GetIndexingStatusApiResponse, V1GetIndexingStatusApiArg>({
        query: (queryArg) => ({ url: `/v1/chains/${queryArg.chainId}/about/indexing` }),
        providesTags: ['chains'],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as cgwApi }
export type V1GetChainsApiResponse = /** status 200  */ ChainPage
export type V1GetChainsApiArg = {
  cursor?: string
}
export type V1GetChainApiResponse = /** status 200  */ Chain
export type V1GetChainApiArg = {
  chainId: string
}
export type V1GetAboutChainApiResponse = /** status 200  */ AboutChain
export type V1GetAboutChainApiArg = {
  chainId: string
}
export type V1GetBackboneApiResponse = /** status 200  */ Backbone
export type V1GetBackboneApiArg = {
  chainId: string
}
export type V1GetMasterCopiesApiResponse = /** status 200  */ MasterCopy[]
export type V1GetMasterCopiesApiArg = {
  chainId: string
}
export type V1GetIndexingStatusApiResponse = /** status 200  */ IndexingStatus
export type V1GetIndexingStatusApiArg = {
  chainId: string
}
export type NativeCurrency = {
  decimals: number
  logoUri: string
  name: string
  symbol: string
}
export type BlockExplorerUriTemplate = {
  address: string
  api: string
  txHash: string
}
export type BalancesProvider = {
  chainName?: number | null
  enabled: boolean
}
export type ContractAddresses = {
  safeSingletonAddress?: string | null
  safeProxyFactoryAddress?: string | null
  multiSendAddress?: string | null
  multiSendCallOnlyAddress?: string | null
  fallbackHandlerAddress?: string | null
  signMessageLibAddress?: string | null
  createCallAddress?: string | null
  simulateTxAccessorAddress?: string | null
  safeWebAuthnSignerFactoryAddress?: string | null
}
export type GasPriceOracle = {
  type: string
  gasParameter: string
  gweiFactor: string
  uri: string
}
export type GasPriceFixed = {
  type: string
  weiValue: string
}
export type GasPriceFixedEip1559 = {
  type: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}
export type RpcUri = {
  authentication: 'API_KEY_PATH' | 'NO_AUTHENTICATION' | 'UNKNOWN'
  value: string
}
export type Theme = {
  backgroundColor: string
  textColor: string
}
export type Chain = {
  chainId: string
  chainName: string
  description: string
  chainLogoUri?: string | null
  l2: boolean
  isTestnet: boolean
  nativeCurrency: NativeCurrency
  transactionService: string
  blockExplorerUriTemplate: BlockExplorerUriTemplate
  beaconChainExplorerUriTemplate: object
  disabledWallets: string[]
  ensRegistryAddress?: string | null
  balancesProvider: BalancesProvider
  contractAddresses: ContractAddresses
  features: string[]
  gasPrice: (GasPriceOracle | GasPriceFixed | GasPriceFixedEip1559)[]
  publicRpcUri: RpcUri
  rpcUri: RpcUri
  safeAppsRpcUri: RpcUri
  shortName: string
  theme: Theme
}
export type ChainPage = {
  count?: number | null
  next?: string | null
  previous?: string | null
  results: Chain[]
}
export type AboutChain = {
  transactionServiceBaseUri: string
  name: string
  version: string
  buildNumber: string
}
export type Backbone = {
  api_version: string
  headers?: string | null
  host: string
  name: string
  secure: boolean
  settings: object | null
  version: string
}
export type MasterCopy = {
  address: string
  version: string
}
export type IndexingStatus = {
  lastSync: number
  synced: boolean
}
export const {
  useV1GetChainsQuery,
  useV1GetChainQuery,
  useV1GetAboutChainQuery,
  useV1GetBackboneQuery,
  useV1GetMasterCopiesQuery,
  useV1GetIndexingStatusQuery,
} = injectedRtkApi
