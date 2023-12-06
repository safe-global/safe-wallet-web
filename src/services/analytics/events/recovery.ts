import { EventType } from '@/services/analytics'

// These are used for the generic stepper flow events (Next, Back)
export const SETUP_RECOVERY_CATEGORY = 'setup-recovery'
export const START_RECOVERY_CATEGORY = 'propose-recovery'
export const REMOVE_RECOVERY_CATEGORY = 'remove-recovery'
export const CANCEL_RECOVERY_CATEGORY = 'cancel-recovery'

const RECOVERY_CATEGORY = 'recovery'

export const RECOVERY_EVENTS = {
  SETUP_RECOVERY: {
    action: 'Start recovery setup',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  SELECT_RECOVERY_METHOD: {
    action: 'Select recovery method',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  CONTINUE_WITH_RECOVERY: {
    action: 'Continue with recovery method',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  CONTINUE_TO_WAITLIST: {
    action: 'Continue to waitlist',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  RECOVERY_SETTINGS: {
    action: 'Recovery settings',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  EDIT_RECOVERY: {
    action: 'Start edit recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  REMOVE_RECOVERY: {
    action: 'Start recovery removal',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  START_RECOVERY: {
    action: 'Start recovery proposal',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  CANCEL_RECOVERY: {
    action: 'Start recovery cancellation',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  SHOW_ADVANCED: {
    action: 'Show advanced recovery settings',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  DISMISS_PROPOSAL_CARD: {
    action: 'Dismiss recovery proposal card',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  LEARN_MORE: {
    action: 'Recovery info click',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  GO_BACK: {
    action: 'Recovery cancellation back',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  GIVE_US_FEEDBACK: {
    action: 'Recovery feedback click',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  CHECK_RECOVERY_PROPOSAL: {
    action: 'Check recovery proposal',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  SUBMIT_RECOVERY_CREATE: {
    action: 'Submit recovery setup',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  SUBMIT_RECOVERY_EDIT: {
    action: 'Submit recovery edit',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  SUBMIT_RECOVERY_REMOVE: {
    action: 'Submit recovery remove',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  SUBMIT_RECOVERY_ATTEMPT: {
    action: 'Submit recovery attempt',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  SUBMIT_RECOVERY_CANCEL: {
    action: 'Submit recovery cancel',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
}
