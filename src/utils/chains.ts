import type { ChainInfo, FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import { getExplorerLink } from './gateway'
import chains from '@/config/chains'

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

export const getShortName = (chainId: string): string | undefined => {
  return Object.entries(chains).find(([, _chainId]) => _chainId === chainId)?.[0]
}

export const getChainId = (shortName: string): string | undefined => {
  return Object.entries(chains).find(([_shortName]) => _shortName === shortName)?.[1]
}
