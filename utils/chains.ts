import type { ChainInfo, FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { getExplorerLink } from './gateway'

export const hasFeature = (chain: ChainInfo, feature: FEATURES): boolean => {
  return chain.features.includes(feature)
}

export const getBlockExplorerLink = (
  chain: ChainInfo,
  address: string,
): { href: string; title: string } | undefined => {
  if (chain.blockExplorerUriTemplate) {
    return getExplorerLink(address, chain.blockExplorerUriTemplate)
  }
}
