import EventBus from '../EventBus'

export enum MsgEvent {
  // Create message
  PROPOSE = 'PROPOSE',
  PROPOSE_FAILED = 'PROPOSE_FAILED',

  // Confirm message
  CONFIRM_PROPOSE = 'CONFIRM_PROPOSE',
  CONFIRM_PROPOSE_FAILED = 'CONFIRM_PROPOSE_FAILED',

  // Dispatched after the backend returns a new message signature
  // Used to clear the pending status of a message
  UPDATED = 'UPDATED',

  // Final signature prepared
  SIGNATURE_PREPARED = 'SIGNATURE_PREPARED',
}

type MessageHash = { messageHash: string }

interface MsgEvents {
  [MsgEvent.PROPOSE]: MessageHash
  [MsgEvent.PROPOSE_FAILED]: MessageHash & { error: Error }
  [MsgEvent.CONFIRM_PROPOSE]: MessageHash
  [MsgEvent.CONFIRM_PROPOSE_FAILED]: MessageHash & { error: Error }
  [MsgEvent.UPDATED]: MessageHash
  [MsgEvent.SIGNATURE_PREPARED]: MessageHash
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
