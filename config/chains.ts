import { RPC_AUTHENTICATION, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'

import { store } from '@/store'
import { selectChains } from '@/store/chainsSlice'
import { INFURA_TOKEN } from '@/config/constants'

const chains: Record<string, string> = selectChains(store.getState()).configs.reduce(
  (acc, { shortName, chainId }) => ({ ...acc, [shortName]: chainId }),
  {},
)

export default chains

export const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}

export const enum CHAIN_ID {
  MAINNET = '1',
}
