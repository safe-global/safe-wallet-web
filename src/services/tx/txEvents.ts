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
  MINING_MODULE = 'MINING_MODULE',
  MINED = 'MINED',
  REVERTED = 'REVERTED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
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
  [TxEvent.MINED]: Id & { receipt: ContractReceipt }
  [TxEvent.REVERTED]: Id & { error: Error; receipt: ContractReceipt }
  [TxEvent.FAILED]: Id & { error: Error }
  [TxEvent.SUCCESS]: Id
}

type ModuleEvents = {
  [TxEvent.MINING_MODULE]: Id & { txHash: string; message: string }
}

type Events = TxEvents & ModuleEvents

const txEventBus = new EventBus<Events>()

export const txDispatch = txEventBus.dispatch.bind(txEventBus)

export const txSubscribe = txEventBus.subscribe.bind(txEventBus)

// Log all events
Object.values(TxEvent).forEach((event: TxEvent) => {
  txSubscribe<TxEvent>(event, (detail) => {
    console.info(`${event} event received`, detail)
  })
})
