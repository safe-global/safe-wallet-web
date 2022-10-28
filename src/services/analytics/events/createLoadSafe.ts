import { getAbTestIsB } from '@/hooks/useABTest'
import { NEW_SAFE_AB_TEST_NAME } from '@/hooks/useNewSafeRoutes'
import { EventType } from '@/services/analytics/types'

export const CREATE_SAFE_CATEGORY = 'create-safe'

// We cannot read the value immediately as the option may not have been decided yet
const isB = () => {
  return getAbTestIsB(NEW_SAFE_AB_TEST_NAME) ? 'New' : 'Old'
}

export const CREATE_SAFE_EVENTS = {
  CREATE_BUTTON: {
    action: 'Open stepper',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  NAME_SAFE: {
    event: EventType.META,
    action: 'Name Safe',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  OWNERS: {
    event: EventType.META,
    action: 'Owners',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  THRESHOLD: {
    event: EventType.META,
    action: 'Threshold',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  SUBMIT_CREATE_SAFE: {
    event: EventType.META,
    action: 'Submit Safe creation',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  REJECT_CREATE_SAFE: {
    event: EventType.META,
    action: 'Reject Safe creation',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  RETRY_CREATE_SAFE: {
    event: EventType.META,
    action: 'Retry Safe creation',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  CANCEL_CREATE_SAFE: {
    event: EventType.META,
    action: 'Cancel Safe creation',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  CREATED_SAFE: {
    event: EventType.META,
    action: 'Created Safe',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  GET_STARTED: {
    action: 'Load Safe',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
  GO_TO_SAFE: {
    action: 'Open Safe',
    category: CREATE_SAFE_CATEGORY,
    abTest: isB,
  },
}

export const LOAD_SAFE_CATEGORY = 'load-safe'

export const LOAD_SAFE_EVENTS = {
  LOAD_BUTTON: {
    action: 'Open stepper',
    category: LOAD_SAFE_CATEGORY,
  },
  NAME_SAFE: {
    event: EventType.META,
    action: 'Name Safe',
    category: LOAD_SAFE_CATEGORY,
  },
  OWNERS: {
    event: EventType.META,
    action: 'Owners',
    category: LOAD_SAFE_CATEGORY,
  },
  THRESHOLD: {
    event: EventType.META,
    action: 'Threshold',
    category: LOAD_SAFE_CATEGORY,
  },
  GO_TO_SAFE: {
    action: 'Open Safe',
    category: LOAD_SAFE_CATEGORY,
  },
}
