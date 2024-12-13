import type { RelayResponse } from '@/services/tx/relaying'

export const hasRemainingRelays = (relays?: RelayResponse): boolean => {
  return !!relays && relays.remaining > 0
}
