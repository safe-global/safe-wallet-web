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

export const createWeb3ReadOnly = ({ rpcUri }: ChainInfo): JsonRpcProvider => {
  return new JsonRpcProvider({ url: getRpcServiceUrl(rpcUri), timeout: 10_000 })
}

export const createWeb3 = (walletProvider: EIP1193Provider): Web3Provider => {
  return new Web3Provider(walletProvider)
}
