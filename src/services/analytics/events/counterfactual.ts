import { EventType } from '@/services/analytics'

const COUNTERFACTUAL_CATEGORY = 'counterfactual'

export const COUNTERFACTUAL_EVENTS = {
  CHOOSE_PAY_NOW: {
    action: 'Choose pay now',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  CHOOSE_PAY_LATER: {
    action: 'Choose pay later',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  BACKUP_COUNTERFACTUAL_SAFE: {
    action: 'Backup counterfactual safe',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  CHECK_BALANCES: {
    action: 'Check balances on block explorer',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
}
