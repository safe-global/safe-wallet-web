import { RPC_AUTHENTICATION, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'

import { INFURA_TOKEN } from '@/config/constants'

export const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}
