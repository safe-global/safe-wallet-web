import { parseUnits } from 'ethers/lib/utils'
import type { MessagePayload } from 'firebase/messaging/sw'
import type { ChainInfo, SafeBalanceResponse, ChainListResponse } from '@safe-global/safe-gateway-typescript-sdk'

import { shortenAddress } from '@/utils/formatters'
import { AppRoutes } from '@/config/routes'

// Types

enum WebhookType {
  NEW_CONFIRMATION = 'NEW_CONFIRMATION',
  EXECUTED_MULTISIG_TRANSACTION = 'EXECUTED_MULTISIG_TRANSACTION',
  PENDING_MULTISIG_TRANSACTION = 'PENDING_MULTISIG_TRANSACTION',
  INCOMING_ETHER = 'INCOMING_ETHER',
  OUTGOING_ETHER = 'OUTGOING_ETHER',
  INCOMING_TOKEN = 'INCOMING_TOKEN',
  OUTGOING_TOKEN = 'OUTGOING_TOKEN',
  SAFE_CREATED = 'SAFE_CREATED',
  MODULE_TRANSACTION = 'MODULE_TRANSACTION',
  CONFIRMATION_REQUEST = 'CONFIRMATION_REQUEST', // Notification-specific webhook
}

type NewConfirmationEvent = {
  type: WebhookType.NEW_CONFIRMATION
  chainId: string
  address: string
  owner: string
  safeTxHash: string
}

type ExecutedMultisigTransactionEvent = {
  type: WebhookType.EXECUTED_MULTISIG_TRANSACTION
  chainId: string
  address: string
  safeTxHash: string
  failed: boolean
  txHash: string
}

type PendingMultisigTransactionEvent = {
  type: WebhookType.PENDING_MULTISIG_TRANSACTION
  chainId: string
  address: string
  safeTxHash: string
}

type IncomingEtherEvent = {
  type: WebhookType.INCOMING_ETHER
  chainId: string
  address: string
  txHash: string
  value: string
}

type OutgoingEtherEvent = {
  type: WebhookType.OUTGOING_ETHER
  chainId: string
  address: string
  txHash: string
  value: string
}

type IncomingTokenEvent = {
  type: WebhookType.INCOMING_TOKEN
  chainId: string
  address: string
  tokenAddress: string
  txHash: string
  value?: string // If ERC-20 token
}

type OutgoingTokenEvent = {
  type: WebhookType.OUTGOING_TOKEN
  chainId: string
  address: string
  tokenAddress: string
  txHash: string
  value?: string // If ERC-20 token
}

type SafeCreatedEvent = {
  type: WebhookType.SAFE_CREATED
  chainId: string
  address: string
  txHash: string
  blockNumber: string
}

type ModuleTransactionEvent = {
  type: WebhookType.MODULE_TRANSACTION
  chainId: string
  address: string
  module: string
  txHash: string
}

type ConfirmationRequest = {
  type: WebhookType.CONFIRMATION_REQUEST
  chainId: string
  address: string
  safeTxHash: string
}

type WebhookEvent =
  | NewConfirmationEvent
  | ExecutedMultisigTransactionEvent
  | PendingMultisigTransactionEvent
  | IncomingEtherEvent
  | OutgoingEtherEvent
  | IncomingTokenEvent
  | OutgoingTokenEvent
  | SafeCreatedEvent
  | ModuleTransactionEvent
  | ConfirmationRequest

// Services

// XHR is not supported in service worker so we can't use the SDK

const BASE_URL = 'https://safe-client.safe.global'

const getChains = async (): Promise<ChainListResponse | undefined> => {
  const ENDPOINT = `${BASE_URL}/v1/chains`

  const response = await fetch(ENDPOINT)

  if (response.ok) {
    return response.json()
  }
}

const getBalances = async (chainId: string, safeAddress: string): Promise<SafeBalanceResponse | undefined> => {
  const DEFAULT_CURRENCY = 'USD'
  const ENDPOINT = `${BASE_URL}/v1/chains/${chainId}/safes/${safeAddress}/balances/${DEFAULT_CURRENCY}`

  const response = await fetch(ENDPOINT)

  if (response.ok) {
    return response.json()
  }
}

const getToken = async (
  chainId: string,
  safeAddress: string,
  tokenAddress: string,
): Promise<SafeBalanceResponse['items'][number] | undefined> => {
  let balances: SafeBalanceResponse | undefined

  try {
    balances = await getBalances(chainId, safeAddress)
  } catch {}

  return balances?.items.find((token) => token.tokenInfo.address === tokenAddress)
}

// Helpers

const isWebhookEvent = <T extends MessagePayload['data']>(data: T): data is T & { ['data']: WebhookEvent } => {
  return Object.values(WebhookType).some((type) => type === data?.type)
}

const getChain = (chainId: string, chains?: Array<ChainInfo>): ChainInfo | undefined => {
  return chains?.find((chain) => chain.chainId === chainId)
}

const getLink = (address: string, path: string, chain?: ChainInfo) => {
  if (!chain) {
    return path
  }

  return `https://app.safe.global${path}?safe=${chain.shortName}:${address}`
}

// Main

export const parseFirebaseNotification = async (
  payload: MessagePayload,
): Promise<
  {
    title?: string
    link: string
  } & NotificationOptions
> => {
  // TODO: Add icon
  let title, body, image
  let link = AppRoutes.index

  if (payload.notification) {
    ;({ title, body, image } = payload.notification)
  }

  if (isWebhookEvent(payload.data)) {
    let chains: Array<ChainInfo> | undefined

    try {
      const response = await getChains()
      chains = response?.results
    } catch {}

    switch (payload.data.type) {
      case WebhookType.NEW_CONFIRMATION: {
        const { address, chainId, owner, safeTxHash } = payload.data
        const chain = getChain(chainId, chains)

        title = `New confirmation`

        body = `Safe ${shortenAddress(address)} on chain ${
          chain?.chainName ?? chainId
        } has a new confirmation from ${shortenAddress(owner)} on transaction ${shortenAddress(safeTxHash)}.`

        link = getLink(address, AppRoutes.transactions.queue, chain)

        break
      }
      case WebhookType.EXECUTED_MULTISIG_TRANSACTION: {
        const { address, chainId, failed, safeTxHash, txHash } = payload.data
        const chain = getChain(chainId, chains)

        if (failed === 'true') {
          title = `Transaction failed`

          body = `Safe ${shortenAddress(address)} on chain ${
            chain?.chainName ?? chainId
          } failed to execute transaction ${shortenAddress(txHash ?? safeTxHash)}.`

          link = getLink(address, AppRoutes.transactions.queue, chain)
        } else {
          title = `Transaction executed`

          body = `Safe ${shortenAddress(address)} on chain ${
            chain?.chainName ?? chainId
          } executed transaction ${shortenAddress(txHash ?? safeTxHash)}.`

          link = getLink(address, AppRoutes.transactions.history, chain)
        }

        break
      }
      case WebhookType.PENDING_MULTISIG_TRANSACTION: {
        const { address, chainId, safeTxHash } = payload.data
        const chain = getChain(chainId, chains)

        title = `New pending transaction`

        body = `Safe ${shortenAddress(address)} on chain ${
          chain?.chainName ?? chainId
        } has a new pending transaction ${shortenAddress(safeTxHash)}.`

        link = getLink(address, AppRoutes.transactions.queue, chain)

        break
      }
      case WebhookType.INCOMING_ETHER: {
        const { address, chainId, txHash, value } = payload.data
        const chain = getChain(chainId, chains)

        title = `Incoming ${chain?.nativeCurrency?.symbol || 'ETH'}`

        body = `Safe ${shortenAddress(address)} on chain ${chain?.chainName ?? chainId} received ${
          chain ? parseUnits(value, chain.nativeCurrency.decimals) : value
        } Ether in transaction ${shortenAddress(txHash)}.`

        link = getLink(address, AppRoutes.transactions.history, chain)

        break
      }
      case WebhookType.OUTGOING_ETHER: {
        const { address, chainId, txHash, value } = payload.data
        const chain = getChain(chainId, chains)

        title = `Outgoing ${chain?.nativeCurrency?.symbol || 'ETH'}`

        body = `Safe ${shortenAddress(address)} on chain ${chain?.chainName ?? chainId} sent ${
          chain ? parseUnits(value, chain.nativeCurrency.decimals) : value
        } Ether in transaction ${shortenAddress(txHash)}.`

        link = getLink(address, AppRoutes.transactions.history, chain)

        break
      }
      case WebhookType.INCOMING_TOKEN: {
        const { address, chainId, tokenAddress, txHash, value } = payload.data
        const chain = getChain(chainId, chains)

        const token = await getToken(chainId, address, tokenAddress)

        title = `Incoming ${token?.tokenInfo?.name || 'Token'}`

        body = `Safe ${shortenAddress(address)} on chain ${chain?.chainName ?? chainId} received ${
          token ? parseUnits(value, token.tokenInfo.decimals) : value
        } Token in transaction ${shortenAddress(txHash)}.`

        link = getLink(address, AppRoutes.transactions.history, chain)

        break
      }
      case WebhookType.OUTGOING_TOKEN: {
        const { address, chainId, tokenAddress, txHash, value } = payload.data
        const chain = getChain(chainId, chains)

        const token = await getToken(chainId, address, tokenAddress)

        title = `Outgoing ${token?.tokenInfo?.name || 'Token'}`

        body = `Safe ${shortenAddress(address)} on chain ${chain?.chainName ?? chainId} sent ${
          token ? parseUnits(value, token.tokenInfo.decimals) : value
        } Token in transaction ${shortenAddress(txHash)}.`

        link = getLink(address, AppRoutes.transactions.history, chain)

        break
      }
      case WebhookType.SAFE_CREATED: {
        // Notifications are subscribed to per Safe so we would only show this notification
        // if the user was subscribed to a pre-determined address

        break
      }
      case WebhookType.MODULE_TRANSACTION: {
        const { address, chainId, module, txHash } = payload.data
        const chain = getChain(chainId, chains)

        title = `Module transaction`

        body = `Safe ${shortenAddress(address)} on chain ${
          chain?.chainName ?? chainId
        } executed a module transaction ${shortenAddress(txHash)} from module ${shortenAddress(module)}.`

        link = getLink(address, AppRoutes.transactions.history, chain)

        break
      }
      case WebhookType.CONFIRMATION_REQUEST: {
        const { address, chainId, safeTxHash } = payload.data
        const chain = getChain(chainId, chains)

        title = `Confirmation request`

        body = `Safe ${shortenAddress(address)} on chain ${
          chain?.chainName ?? chainId
        } has a new confirmation request for transaction ${shortenAddress(safeTxHash)}.`

        link = getLink(address, AppRoutes.transactions.queue, chain)

        break
      }
    }
  }

  return { title, body, image, link }
}
