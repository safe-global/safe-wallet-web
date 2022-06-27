import { RPC_AUTHENTICATION, type ChainInfo, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'
import { INFURA_TOKEN } from '@/config/constants'
import { EIP1193Provider } from '@web3-onboard/core'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import ExternalStore from '@/services/ExternalStore'

// RPC helpers
const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}

export const createWeb3ReadOnly = ({ rpcUri }: ChainInfo): JsonRpcProvider => {
  return new JsonRpcProvider({ url: getRpcServiceUrl(rpcUri), timeout: 10_000 })
}

export const createWeb3 = (walletProvider: EIP1193Provider): Web3Provider => {
  return new Web3Provider(walletProvider)
}

export const { getStore: getWeb3, setStore: setWeb3, useStore: useWeb3 } = new ExternalStore<Web3Provider>()

export const {
  getStore: getWeb3ReadOnly,
  setStore: setWeb3ReadOnly,
  useStore: useWeb3ReadOnly,
} = new ExternalStore<JsonRpcProvider>()
