import EventBus from '@/services/EventBus'
import type { RequestId } from '@safe-global/safe-apps-sdk'

export enum TxEvent {
  SIGNED = 'SIGNED',
  SIGN_FAILED = 'SIGN_FAILED',
  PROPOSED = 'PROPOSED',
  PROPOSE_FAILED = 'PROPOSE_FAILED',
  SIGNATURE_PROPOSED = 'SIGNATURE_PROPOSED',
  SIGNATURE_PROPOSE_FAILED = 'SIGNATURE_PROPOSE_FAILED',
  SIGNATURE_INDEXED = 'SIGNATURE_INDEXED',
  ONCHAIN_SIGNATURE_REQUESTED = 'ONCHAIN_SIGNATURE_REQUESTED',
  ONCHAIN_SIGNATURE_SUCCESS = 'ONCHAIN_SIGNATURE_SUCCESS',
  EXECUTING = 'EXECUTING',
  PROCESSING = 'PROCESSING',
  PROCESSING_MODULE = 'PROCESSING_MODULE',
  PROCESSED = 'PROCESSED',
  REVERTED = 'REVERTED',
  RELAYING = 'RELAYING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
  SAFE_APPS_REQUEST = 'SAFE_APPS_REQUEST',
}

type Id = { txId: string; groupKey?: string } | { txId?: string; groupKey: string }

interface TxEvents {
  [TxEvent.SIGNED]: { txId?: string }
  [TxEvent.SIGN_FAILED]: { txId?: string; error: Error }
  [TxEvent.PROPOSE_FAILED]: { error: Error }
  [TxEvent.PROPOSED]: { txId: string }
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: { txId: string; error: Error }
  [TxEvent.SIGNATURE_PROPOSED]: { txId: string; signerAddress: string }
  [TxEvent.SIGNATURE_INDEXED]: { txId: string }
  [TxEvent.ONCHAIN_SIGNATURE_REQUESTED]: Id
  [TxEvent.ONCHAIN_SIGNATURE_SUCCESS]: Id
  [TxEvent.EXECUTING]: Id
  [TxEvent.PROCESSING]: Id & { txHash: string }
  [TxEvent.PROCESSING_MODULE]: Id & { txHash: string }
  [TxEvent.PROCESSED]: Id & { safeAddress: string }
  [TxEvent.REVERTED]: Id & { error: Error }
  [TxEvent.RELAYING]: Id & { taskId: string }
  [TxEvent.FAILED]: Id & { error: Error }
  [TxEvent.SUCCESS]: Id
  [TxEvent.SAFE_APPS_REQUEST]: { safeAppRequestId: RequestId; safeTxHash: string }
}

const txEventBus = new EventBus<TxEvents>()

export const txDispatch = txEventBus.dispatch.bind(txEventBus)

export const txSubscribe = txEventBus.subscribe.bind(txEventBus)

// Log all events
Object.values(TxEvent).forEach((event: TxEvent) => {
  txSubscribe<TxEvent>(event, (detail) => {
    console.info(`Transaction ${event} event received`, detail)
  })
})
