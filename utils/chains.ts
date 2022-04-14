import type { RpcUri } from '@gnosis.pm/safe-react-gateway-sdk/dist/types/chains'

import { INFURA_TOKEN } from 'config/constants'

export const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string = INFURA_TOKEN): string => {
  // TODO: Support importing enums from external files
  const needsToken = authentication === 'API_KEY_PATH'
  return needsToken ? `${value}${TOKEN}` : value
}
