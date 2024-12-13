import EventBus from '@/services/EventBus'

export enum SafeCreationEvent {
  PROCESSING = 'PROCESSING',
  RELAYING = 'RELAYING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERTED = 'REVERTED',
  INDEXED = 'INDEXED',
}

export interface SafeCreationEvents {
  [SafeCreationEvent.PROCESSING]: {
    groupKey: string
    txHash: string
  }
  [SafeCreationEvent.RELAYING]: {
    groupKey: string
    taskId: string
  }
  [SafeCreationEvent.SUCCESS]: {
    groupKey: string
    safeAddress: string
  }
  [SafeCreationEvent.INDEXED]: {
    groupKey: string
    safeAddress: string
  }
  [SafeCreationEvent.FAILED]: {
    groupKey: string
    error: Error
  }
  [SafeCreationEvent.REVERTED]: {
    groupKey: string
    error: Error
  }
}

const SafeCreationEventBus = new EventBus<SafeCreationEvents>()

export const safeCreationDispatch = SafeCreationEventBus.dispatch.bind(SafeCreationEventBus)

export const safeCreationSubscribe = SafeCreationEventBus.subscribe.bind(SafeCreationEventBus)

// Log all events
Object.values(SafeCreationEvent).forEach((event: SafeCreationEvent) => {
  safeCreationSubscribe<SafeCreationEvent>(event, (detail) => {
    console.info(`[Safe creation]: ${event}`, detail)
  })
})
