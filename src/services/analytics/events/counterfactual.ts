import { EventType } from '@/services/analytics'

const COUNTERFACTUAL_CATEGORY = 'counterfactual'

export const COUNTERFACTUAL_EVENTS = {
  CREATE_COUNTERFACTUAL_SAFE: {
    action: 'Create counterfactual safe',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
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
  CHOOSE_FIRST_TRANSACTION: {
    action: 'Choose first transaction',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  PRESS_CREATE_TRANSACTION: {
    action: 'Press create transaction',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  PRESS_ADD_FUNDS: {
    action: 'Press add funds',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  SUBMIT_ACCOUNT_ACTIVATION: {
    action: 'Submit account activation',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
  DEPLOYED_COUNTERFACTUAL_SAFE: {
    action: 'Deployed counterfactual safe',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.META,
  },
  CHECK_BALANCES: {
    action: 'Check balances on block explorer',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
}
