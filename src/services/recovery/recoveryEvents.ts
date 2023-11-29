import EventBus from '../EventBus'

export enum RecoveryEvent {
  EXECUTING = 'EXECUTING',
  PROCESSING = 'PROCESSING',
  REVERTED = 'REVERTED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

interface RecoveryEvents {
  [RecoveryEvent.EXECUTING]: { moduleAddress: string; recoveryTxHash: string }
  [RecoveryEvent.PROCESSING]: { moduleAddress: string; recoveryTxHash: string }
  [RecoveryEvent.REVERTED]: { moduleAddress: string; recoveryTxHash: string; error: Error }
  [RecoveryEvent.PROCESSED]: { moduleAddress: string; recoveryTxHash: string }
  [RecoveryEvent.FAILED]: { moduleAddress: string; recoveryTxHash?: string; error: Error }
}

const recoveryEventBus = new EventBus<RecoveryEvents>()

export const recoveryDispatch = recoveryEventBus.dispatch.bind(recoveryEventBus)

export const recoverySubscribe = recoveryEventBus.subscribe.bind(recoveryEventBus)

// Log all events
Object.values(RecoveryEvent).forEach((event: RecoveryEvent) => {
  recoverySubscribe<RecoveryEvent>(event, (detail) => {
    console.info(`Recovery ${event} event received`, detail)
  })
})
