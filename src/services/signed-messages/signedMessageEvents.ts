import EventBus from '../EventBus'

export enum SignedMessageEvent {
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

type SignedMessageMessageHash = { messageHash: string }

interface SignedMessageEvents {
  [SignedMessageEvent.PROPOSE]: SignedMessageMessageHash
  [SignedMessageEvent.PROPOSE_FAILED]: SignedMessageMessageHash & { error: Error }
  [SignedMessageEvent.CONFIRM_PROPOSE]: SignedMessageMessageHash
  [SignedMessageEvent.CONFIRM_PROPOSE_FAILED]: SignedMessageMessageHash & { error: Error }
  [SignedMessageEvent.UPDATED]: SignedMessageMessageHash
  [SignedMessageEvent.SIGNATURE_PREPARED]: SignedMessageMessageHash
}

const signedMessageEventBus = new EventBus<SignedMessageEvents>()

export const signedMessageDispatch = signedMessageEventBus.dispatch.bind(signedMessageEventBus)

export const signedMessageSubscribe = signedMessageEventBus.subscribe.bind(signedMessageEventBus)

// Log all events
Object.values(SignedMessageEvent).forEach((event: SignedMessageEvent) => {
  signedMessageSubscribe<SignedMessageEvent>(event, (detail) => {
    console.info(`Message ${event} event received`, detail)
  })
})
