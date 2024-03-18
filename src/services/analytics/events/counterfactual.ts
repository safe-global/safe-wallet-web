import { EventType } from '@/services/analytics'

const COUNTERFACTUAL_CATEGORY = 'counterfactual'

export const COUNTERFACTUAL_EVENTS = {
  CHECK_BALANCES: {
    action: 'Check balances on block explorer',
    category: COUNTERFACTUAL_CATEGORY,
    event: EventType.CLICK,
  },
}
