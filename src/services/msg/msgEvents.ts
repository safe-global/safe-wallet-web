import EventBus from '../EventBus'

export enum MsgEvent {
  CREATE = 'CREATE',
  CREATE_FAILED = 'CREATE_FAILED',
  CONFIRM = 'CONFIRM',
  CONFIRM_FAILED = 'CONFIRM_FAILED',
  CONFIRMATION_SAVED = 'CONFIRMATION_SAVED',
  FULLY_CONFIRMED = 'CONFIRMED',
}

type MessageHash = { messageHash: string }

interface MsgEvents {
  // New message signed/sent to backend
  [MsgEvent.CREATE]: MessageHash
  // New message signing rejected or backend error
  [MsgEvent.CREATE_FAILED]: { error: Error }
  // Existing message signed/sent to backend
  [MsgEvent.CONFIRM]: MessageHash
  // Existing message signing rejected or backend error
  [MsgEvent.CONFIRM_FAILED]: MessageHash & { error: Error }
  // Confirmed message returned after `CREATE` or `CONFIRM`
  [MsgEvent.CONFIRMATION_SAVED]: MessageHash
  // Fully confirmed message returned after `CREATE` or `CONFIRM`
  [MsgEvent.FULLY_CONFIRMED]: MessageHash
}

const msgEventBus = new EventBus<MsgEvents>()

export const msgDispatch = msgEventBus.dispatch.bind(msgEventBus)

export const msgSubscribe = msgEventBus.subscribe.bind(msgEventBus)

// Log all events
Object.values(MsgEvent).forEach((event: MsgEvent) => {
  msgSubscribe<MsgEvent>(event, (detail) => {
    console.info(`Message ${event} event received`, detail)
  })
})
