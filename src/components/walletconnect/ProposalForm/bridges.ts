import { StrictAddressBridges, DefaultAddressBridges } from '../constants'

// Bridge enforces the same address on destination chain
export const isStrictAddressBridge = (origin: string) => {
  return StrictAddressBridges.some((bridge) => origin.includes(bridge))
}

// Bridge defaults to same address on destination chain but allows changing it
export const isDefaultAddressBridge = (origin: string) => {
  return DefaultAddressBridges.some((bridge) => origin.includes(bridge))
}
