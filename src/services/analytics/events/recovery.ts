import { EventType } from '@/services/analytics'

export const RECOVERY_CATEGORY = 'recovery'

export const RECOVERY_EVENTS = {
  SETUP_RECOVERY: {
    action: 'Set-up recovery',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  SHOW_ADVANCED: {
    action: 'Show advanced recovery settings',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
  DISMISS_PROPOSAL_CARD: {
    action: 'Recovery do it later',
    category: RECOVERY_CATEGORY,
    event: EventType.CLICK,
  },
}
