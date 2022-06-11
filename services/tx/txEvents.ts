import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import type { ContractReceipt } from 'ethers/lib/ethers'
import EventBus from '@/services/EventBus'

export enum TxEvent {
  CREATED = 'CREATED',
  SIGNED = 'SIGNED',
  SIGN_FAILED = 'SIGN_FAILED',
  PROPOSED = 'PROPOSED',
  PROPOSE_FAILED = 'PROPOSE_FAILED',
  EXECUTING = 'EXECUTING',
  MINING = 'MINING',
  MINED = 'MINED',
  REVERTED = 'REVERTED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

interface TxEvents {
  [TxEvent.CREATED]: { tx: SafeTransaction }
  [TxEvent.SIGNED]: { txId?: string; tx: SafeTransaction }
  [TxEvent.SIGN_FAILED]: { txId?: string; tx: SafeTransaction; error: Error }
  [TxEvent.PROPOSE_FAILED]: { tx: SafeTransaction; error: Error }
  [TxEvent.PROPOSED]: { txId: string; tx: SafeTransaction }
  [TxEvent.EXECUTING]: { txId?: string; tx: SafeTransaction }
  [TxEvent.MINING]: { txId?: string; txHash: string; tx: SafeTransaction }
  [TxEvent.MINED]: { txId?: string; receipt: ContractReceipt; tx: SafeTransaction }
  [TxEvent.REVERTED]: { txId?: string; error: Error; receipt: ContractReceipt; tx?: SafeTransaction }
  [TxEvent.FAILED]: { txId?: string; error: Error; tx?: SafeTransaction }
  [TxEvent.SUCCESS]: { txId: string }
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
