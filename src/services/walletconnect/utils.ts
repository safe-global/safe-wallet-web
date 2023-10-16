import { buildApprovedNamespaces } from '@walletconnect/utils'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { ChainInfo } from '@safe-global/safe-apps-sdk'
import type { ProposalTypes } from '@walletconnect/types'

import { EIP155, SAFE_COMPATIBLE_METHODS } from './constants'

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

export const getNamespaces = (
  proposal: Web3WalletTypes.SessionProposal,
  currentChainId: string,
  safeAddress: string,
) => {
  // Most dApps require mainnet, but we aren't always on mainnet
  // As workaround, we pretend include all required and optional chains with the Safe chainId
  const requiredChains = proposal.params.requiredNamespaces[EIP155]?.chains || []
  const optionalChains = proposal.params.optionalNamespaces[EIP155]?.chains || []

  const supportedChainIds = [currentChainId].concat(
    requiredChains.map(stripEip155Prefix),
    optionalChains.map(stripEip155Prefix),
  )

  const eip155ChainIds = supportedChainIds.map(getEip155ChainId)
  const eip155Accounts = eip155ChainIds.map((eip155ChainId) => `${eip155ChainId}:${safeAddress}`)

  // Don't include optionalNamespaces methods/events
  const methods = proposal.params.requiredNamespaces[EIP155]?.methods ?? SAFE_COMPATIBLE_METHODS
  const events = proposal.params.requiredNamespaces[EIP155]?.events || []

  return buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: {
      [EIP155]: {
        chains: eip155ChainIds,
        accounts: eip155Accounts,
        methods,
        events,
      },
    },
  })
}
