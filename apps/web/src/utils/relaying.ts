import type { RelayCountResponse } from '@safe-global/safe-gateway-typescript-sdk'

export const hasRemainingRelays = (relays?: RelayCountResponse): boolean => {
  return !!relays && relays.remaining > 0
}
