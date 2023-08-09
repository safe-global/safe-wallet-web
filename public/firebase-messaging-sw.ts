/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app'
import { onBackgroundMessage } from 'firebase/messaging/sw'
import { getMessaging } from 'firebase/messaging/sw'
import type { MessagePayload } from 'firebase/messaging/sw'

// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: unknown }

// Satisfy Workbox
self.__WB_MANIFEST

// TODO: Remove those which aren't used for notifications
// https://github.com/safe-global/safe-transaction-service/blob/c562ef3a43f77f6d38e9ea704e1434394598aa30/safe_transaction_service/history/signals.py#L138
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

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
})

const messaging = getMessaging(app)

const isWebhookEvent = <T extends MessagePayload['data']>(data: T): data is T & { ['data']: WebhookEvent } => {
  return Object.values(WebhookType).some((type) => type === data?.type)
}

onBackgroundMessage(messaging, (payload) => {
  // TODO: Add default values
  let title, body, image

  if (payload.notification) {
    ;({ title, body, image } = payload.notification)
  }

  if (isWebhookEvent(payload.data)) {
    switch (payload.data.type) {
      case WebhookType.NEW_CONFIRMATION: {
        const { address, chainId, owner, safeTxHash } = payload.data

        title = `New confirmation for ${safeTxHash}`
        body = `Safe ${address} on chain ${chainId} has a new confirmation from ${owner}.`

        break
      }
      case WebhookType.EXECUTED_MULTISIG_TRANSACTION: {
        const { address, chainId, failed, safeTxHash, txHash } = payload.data

        title = failed ? `Transaction ${safeTxHash} failed` : `Transaction ${safeTxHash} executed`
        body = failed
          ? `Safe ${address} on chain ${chainId} failed to execute transaction ${txHash}.`
          : `Safe ${address} on chain ${chainId} executed transaction ${txHash}.`

        break
      }
      case WebhookType.PENDING_MULTISIG_TRANSACTION: {
        const { address, chainId, safeTxHash } = payload.data

        title = `New pending transaction for ${safeTxHash}`
        body = `Safe ${address} on chain ${chainId} has a new pending transaction ${safeTxHash}.`

        break
      }
      case WebhookType.INCOMING_ETHER: {
        const { address, chainId, txHash, value } = payload.data

        // TODO: Native currency
        title = `Incoming Ether`
        // TODO: Parse value
        body = `Safe ${address} on chain ${chainId} received ${value} Ether in transaction ${txHash}.`

        break
      }
      case WebhookType.OUTGOING_ETHER: {
        const { address, chainId, txHash, value } = payload.data

        // TODO: Native currency
        title = `Outgoing Ether`
        body = `Safe ${address} on chain ${chainId} sent ${value} Ether in transaction ${txHash}.`

        break
      }
      case WebhookType.INCOMING_TOKEN: {
        const { address, chainId, tokenAddress, txHash, value } = payload.data

        // TODO: Parse value and get token symbol
        title = `Incoming Token`
        body = `Safe ${address} on chain ${chainId} received ${value} Token in transaction ${txHash}.`

        break
      }
      case WebhookType.OUTGOING_TOKEN: {
        const { address, chainId, tokenAddress, txHash, value } = payload.data

        // TODO: Parse value and get token symbol
        title = `Outgoing Token`
        body = `Safe ${address} on chain ${chainId} sent ${value} Token in transaction ${txHash}.`

        break
      }
      case WebhookType.SAFE_CREATED: {
        const { address, chainId, txHash, blockNumber } = payload.data

        title = `Safe created`
        body = `Safe ${address} on chain ${chainId} was created in transaction ${txHash} in block ${blockNumber}.`

        break
      }
      case WebhookType.MODULE_TRANSACTION: {
        const { address, chainId, module, txHash } = payload.data

        title = `Module transaction`
        body = `Safe ${address} on chain ${chainId} executed a module transaction ${txHash} from module ${module}.`

        break
      }
      case WebhookType.CONFIRMATION_REQUEST: {
        const { address, chainId, safeTxHash } = payload.data

        title = `Confirmation request`
        body = `Safe ${address} on chain ${chainId} has a new confirmation request for transaction ${safeTxHash}.`

        break
      }
    }
  }

  if (title) {
    self.registration.showNotification(title, {
      body,
      icon: image,
    })
  }
})
