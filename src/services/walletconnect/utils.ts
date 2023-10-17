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

export const getSupportedChainIds = (configs: Array<ChainInfo>, params: ProposalTypes.Struct): Array<string> => {
  const { requiredNamespaces, optionalNamespaces } = params

  const requiredChains = requiredNamespaces[EIP155]?.chains ?? []
  const optionalChains = optionalNamespaces[EIP155]?.chains ?? []

  return configs
    .filter((chain) => {
      const eipChainId = getEip155ChainId(chain.chainId)
      return requiredChains.includes(eipChainId) || optionalChains.includes(eipChainId)
    })
    .map((chain) => chain.chainId)
}
