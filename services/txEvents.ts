import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import type { ContractReceipt } from 'ethers/lib/ethers'

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
  [TxEvent.SIGNED]: { tx: SafeTransaction }
  [TxEvent.SIGN_FAILED]: { tx: SafeTransaction; error: Error }
  [TxEvent.PROPOSE_FAILED]: { tx: SafeTransaction; error: Error }
  [TxEvent.PROPOSED]: { txId: string }
  [TxEvent.EXECUTING]: { txId: string }
  [TxEvent.MINING]: { txId: string; txHash: string }
  [TxEvent.MINED]: { txId: string; receipt: ContractReceipt }
  [TxEvent.REVERTED]: { txId: string; error: Error; receipt: ContractReceipt }
  [TxEvent.FAILED]: { txId: string; error: Error }
  [TxEvent.SUCCESS]: { txId: string }
}

const txEventBus = new EventTarget()

export const txDispatch = <T extends TxEvent>(eventType: T, detail: TxEvents[T]) => {
  const e = new CustomEvent(eventType, { detail })
  txEventBus.dispatchEvent(e)
}

export const txSubscribe = <T extends TxEvent>(eventType: T, callback: (detail: TxEvents[T]) => void) => {
  const handler = (e: Event) => {
    if (e instanceof CustomEvent) {
      callback(e.detail as TxEvents[T])
    }
  }
  txEventBus.addEventListener(eventType, handler)

  // Return an unsubscribe function
  return () => txEventBus.removeEventListener(eventType, handler)
}

// Log all events
Object.values(TxEvent).forEach((event: TxEvent) => {
  txSubscribe<TxEvent>(event, (detail) => {
    console.info(`${event} event received: ${detail}`)
  })
})
