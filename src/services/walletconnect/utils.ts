import type { ChainInfo } from '@safe-global/safe-apps-sdk'
import type { ProposalTypes } from '@walletconnect/types'

import { EIP155 } from './constants'

export const isPairingUri = (uri: string): boolean => {
  return uri.startsWith('wc:')
}

export const getEip155ChainId = (chainId: string): string => {
  return `${EIP155}:${chainId}`
}

export const stripEip155Prefix = (eip155Address: string): string => {
  return eip155Address.split(':').pop() ?? ''
}

export const getSupportedEip155ChainIds = (
  requiredNamespaces: ProposalTypes.RequiredNamespaces,
  optionalNamespaces: ProposalTypes.OptionalNamespaces,
): Array<string> => {
  const requiredChains = requiredNamespaces[EIP155]?.chains ?? []
  const optionalChains = optionalNamespaces[EIP155]?.chains ?? []

  return requiredChains.concat(optionalChains)
}

export const getSupportedChainIds = (
  configs: Array<ChainInfo>,
  { requiredNamespaces, optionalNamespaces }: ProposalTypes.Struct,
): Array<string> => {
  const supportedEip155ChainIds = getSupportedEip155ChainIds(requiredNamespaces, optionalNamespaces)

  return configs
    .filter((chain) => {
      const eipChainId = getEip155ChainId(chain.chainId)
      return supportedEip155ChainIds.includes(eipChainId)
    })
    .map((chain) => chain.chainId)
}
