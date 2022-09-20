import type { ContractReceipt } from 'ethers/lib/ethers'
import EventBus from '@/services/EventBus'
import { RequestId } from '@gnosis.pm/safe-apps-sdk'

export enum TxEvent {
  SIGNED = 'SIGNED',
  SIGN_FAILED = 'SIGN_FAILED',
  PROPOSED = 'PROPOSED',
  PROPOSE_FAILED = 'PROPOSE_FAILED',
  SIGNATURE_PROPOSED = 'SIGNATURE_PROPOSED',
  SIGNATURE_PROPOSE_FAILED = 'SIGNATURE_PROPOSE_FAILED',
  EXECUTING = 'EXECUTING',
  MINING = 'MINING',
  MINING_MODULE = 'MINING_MODULE',
  MINED = 'MINED',
  REVERTED = 'REVERTED',
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
  [TxEvent.SIGNATURE_PROPOSED]: { txId: string }
  [TxEvent.EXECUTING]: Id
  [TxEvent.MINING]: Id & { txHash: string }
  [TxEvent.MINING_MODULE]: Id & { txHash: string }
  [TxEvent.MINED]: Id & { receipt: ContractReceipt }
  [TxEvent.REVERTED]: Id & { error: Error; receipt: ContractReceipt }
  [TxEvent.FAILED]: Id & { error: Error }
  [TxEvent.SUCCESS]: Id
  [TxEvent.SAFE_APPS_REQUEST]: Id & { safeAppRequestId: RequestId }
}

const txEventBus = new EventBus<TxEvents>()

export const txDispatch = txEventBus.dispatch.bind(txEventBus)

export const txSubscribe = txEventBus.subscribe.bind(txEventBus)

// Log all events
Object.values(TxEvent).forEach((event: TxEvent) => {
  txSubscribe<TxEvent>(event, (detail) => {
    console.info(`${event} event received`, detail)
  })
})
