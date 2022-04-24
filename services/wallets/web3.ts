import Web3 from 'web3'
import { RPC_AUTHENTICATION, type ChainInfo, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'
import { INFURA_TOKEN } from '@/config/constants'

// RPC helpers
const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}

// Web3 readonly
let _web3ReadOnly: Web3

export const getWeb3ReadOnly = (): Web3 => _web3ReadOnly

export const setWeb3ReadOnly = ({ rpcUri }: ChainInfo): void => {
  _web3ReadOnly = new Web3(
    new Web3.providers.HttpProvider(getRpcServiceUrl(rpcUri), {
      timeout: 10_000,
    }),
  )
}