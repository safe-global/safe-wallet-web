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
  [TxEvent.CREATED]: { txHash: string }
  [TxEvent.SIGNED]: { txHash: string }
  [TxEvent.SIGN_FAILED]: { txHash: string; error: Error }
  [TxEvent.PROPOSE_FAILED]: { txHash: string; error: Error }
  [TxEvent.PROPOSED]: { txHash: string }
  [TxEvent.EXECUTING]: { txHash: string }
  [TxEvent.MINING]: { txHash: string }
  [TxEvent.MINED]: { txHash: string; receipt: ContractReceipt }
  [TxEvent.REVERTED]: { txHash: string; error: Error; receipt: ContractReceipt }
  [TxEvent.FAILED]: { txHash: string; error: Error }
  [TxEvent.SUCCESS]: { txHash: string }
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
