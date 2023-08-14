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
  BATCH_ADD = 'BATCH_ADD',
}

type Id = { txId: string; groupKey?: string } | { txId?: string; groupKey: string }
type TxDescription = { humanDescription?: string }

interface TxEvents {
  [TxEvent.SIGNED]: TxDescription & { txId?: string }
  [TxEvent.SIGN_FAILED]: TxDescription & { txId?: string; error: Error }
  [TxEvent.PROPOSE_FAILED]: TxDescription & { error: Error }
  [TxEvent.PROPOSED]: TxDescription & { txId: string }
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: TxDescription & { txId: string; error: Error }
  [TxEvent.SIGNATURE_PROPOSED]: TxDescription & { txId: string; signerAddress: string }
  [TxEvent.SIGNATURE_INDEXED]: TxDescription & { txId: string }
  [TxEvent.ONCHAIN_SIGNATURE_REQUESTED]: Id & TxDescription
  [TxEvent.ONCHAIN_SIGNATURE_SUCCESS]: Id & TxDescription
  [TxEvent.EXECUTING]: Id & TxDescription
  [TxEvent.PROCESSING]: Id & TxDescription & { txHash: string }
  [TxEvent.PROCESSING_MODULE]: Id & TxDescription & { txHash: string }
  [TxEvent.PROCESSED]: Id & TxDescription & { safeAddress: string }
  [TxEvent.REVERTED]: Id & TxDescription & { error: Error }
  [TxEvent.RELAYING]: Id & TxDescription & { taskId: string }
  [TxEvent.FAILED]: Id & TxDescription & { error: Error }
  [TxEvent.SUCCESS]: Id & TxDescription
  [TxEvent.SAFE_APPS_REQUEST]: TxDescription & { safeAppRequestId: RequestId; safeTxHash: string }
  [TxEvent.BATCH_ADD]: Id & TxDescription
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
