import { EventType } from '@/services/analytics'

// These are used for the generic stepper flow events (Next, Back)
export const SETUP_RECOVERY_CATEGORY = 'setup-recovery'
export const START_RECOVERY_CATEGORY = 'start-recovery'
export const REMOVE_RECOVERY_CATEGORY = 'remove-recovery'
export const CANCEL_RECOVERY_CATEGORY = 'cancel-recovery'

const RECOVERY_CATEGORY = 'recovery'

export const RECOVERY_EVENTS = {
  SETUP_RECOVERY: {
    action: 'Set up recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  RECOVERY_SETTINGS: {
    action: 'Recovery settings',
    category: RECOVERY_CATEGORY,
    event: EventType.META,
  },
  EDIT_RECOVERY: {
    action: 'Edit recovery setup',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  DISABLE_RECOVERY: {
    action: 'Disable recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  START_RECOVERY: {
    action: 'Start recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  CANCEL_RECOVERY: {
    action: 'Cancel recovery',
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
    action: 'Learn more about recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  GO_BACK: {
    action: 'Go back on cancel recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
}
