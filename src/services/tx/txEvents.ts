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
type HumanDescription = { humanDescription?: string }

interface TxEvents {
  [TxEvent.SIGNED]: { txId?: string }
  [TxEvent.SIGN_FAILED]: HumanDescription & { txId?: string; error: Error }
  [TxEvent.PROPOSE_FAILED]: HumanDescription & { error: Error }
  [TxEvent.PROPOSED]: HumanDescription & { txId: string }
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: HumanDescription & { txId: string; error: Error }
  [TxEvent.SIGNATURE_PROPOSED]: HumanDescription & { txId: string; signerAddress: string }
  [TxEvent.SIGNATURE_INDEXED]: { txId: string }
  [TxEvent.ONCHAIN_SIGNATURE_REQUESTED]: Id & HumanDescription
  [TxEvent.ONCHAIN_SIGNATURE_SUCCESS]: Id & HumanDescription
  [TxEvent.EXECUTING]: Id & HumanDescription
  [TxEvent.PROCESSING]: Id & HumanDescription & { txHash: string }
  [TxEvent.PROCESSING_MODULE]: Id & HumanDescription & { txHash: string }
  [TxEvent.PROCESSED]: Id & HumanDescription & { safeAddress: string }
  [TxEvent.REVERTED]: Id & HumanDescription & { error: Error }
  [TxEvent.RELAYING]: Id & { taskId: string }
  [TxEvent.FAILED]: Id & HumanDescription & { error: Error }
  [TxEvent.SUCCESS]: Id & HumanDescription
  [TxEvent.SAFE_APPS_REQUEST]: { safeAppRequestId: RequestId; safeTxHash: string }
  [TxEvent.BATCH_ADD]: Id
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
