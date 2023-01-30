import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const isNativeToken = (tokenInfo: TokenInfo) => {
  return tokenInfo.type === TokenType.NATIVE_TOKEN
}
