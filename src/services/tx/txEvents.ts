import type { ContractReceipt } from 'ethers/lib/ethers'
import EventBus from '@/services/EventBus'

export enum TxEvent {
  SIGNED = 'SIGNED',
  SIGN_FAILED = 'SIGN_FAILED',
  PROPOSED = 'PROPOSED',
  PROPOSE_FAILED = 'PROPOSE_FAILED',
  SIGNATURE_PROPOSED = 'SIGNATURE_PROPOSED',
  SIGNATURE_PROPOSE_FAILED = 'SIGNATURE_PROPOSE_FAILED',
  EXECUTING = 'EXECUTING',
  MINING = 'MINING',
  MINED = 'MINED',
  REVERTED = 'REVERTED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

type Id = { txId: string; batchId?: string } | { txId?: string; batchId: string }

interface TxEvents {
  [TxEvent.SIGNED]: { txId?: string; message?: string }
  [TxEvent.SIGN_FAILED]: { txId?: string; error: Error; message?: string }
  [TxEvent.PROPOSE_FAILED]: { error: Error; message?: string }
  [TxEvent.PROPOSED]: { txId: string; message?: string }
  [TxEvent.SIGNATURE_PROPOSE_FAILED]: { txId: string; error: Error; message?: string }
  [TxEvent.SIGNATURE_PROPOSED]: { txId: string; message?: string }
  [TxEvent.EXECUTING]: Id & { message?: string }
  [TxEvent.MINING]: Id & { txHash: string; message?: string }
  [TxEvent.MINED]: Id & { receipt: ContractReceipt; message?: string }
  [TxEvent.REVERTED]: Id & { error: Error; receipt: ContractReceipt; message?: string }
  [TxEvent.FAILED]: Id & { error: Error; message?: string }
  [TxEvent.SUCCESS]: Id & { message?: string }
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
