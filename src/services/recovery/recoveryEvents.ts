import EventBus from '../EventBus'

export enum RecoveryEvent {
  EXECUTING = 'EXECUTING',
  PROCESSING = 'PROCESSING',
  REVERTED = 'REVERTED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum RecoveryEventType {
  PROPOSAL = 'PROPOSAL',
  EXECUTION = 'EXECUTION',
  SKIP_EXPIRED = 'SKIP_EXPIRED',
}

export interface RecoveryEvents {
  [RecoveryEvent.EXECUTING]: { moduleAddress: string; recoveryTxHash: string; eventType: RecoveryEventType }
  [RecoveryEvent.PROCESSING]: { moduleAddress: string; recoveryTxHash: string; eventType: RecoveryEventType }
  [RecoveryEvent.REVERTED]: {
    moduleAddress: string
    recoveryTxHash: string
    error: Error
    eventType: RecoveryEventType
  }
  [RecoveryEvent.PROCESSED]: { moduleAddress: string; recoveryTxHash: string; eventType: RecoveryEventType }
  [RecoveryEvent.FAILED]: { moduleAddress: string; recoveryTxHash?: string; error: Error; eventType: RecoveryEventType }
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
