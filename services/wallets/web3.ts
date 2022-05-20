import { RPC_AUTHENTICATION, type ChainInfo, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'
import { INFURA_TOKEN } from '@/config/constants'
import { EIP1193Provider } from '@web3-onboard/core'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

// RPC helpers
const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}

// Web3 readonly
let _web3ReadOnly: JsonRpcProvider

export const getWeb3ReadOnly = (): JsonRpcProvider => _web3ReadOnly

export const setWeb3ReadOnly = ({ rpcUri }: ChainInfo): void => {
  _web3ReadOnly = new JsonRpcProvider({ url: getRpcServiceUrl(rpcUri), timeout: 10_000 })
}

// Regular web3
let _web3: Web3Provider

export const getWeb3 = (): Web3Provider => _web3

export const setWeb3 = (walletProvider: EIP1193Provider): void => {
  _web3 = new Web3Provider(walletProvider)
}
