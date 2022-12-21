import { EventType } from '@/services/analytics/types'

export const CREATE_SAFE_CATEGORY = 'create-safe'

export const CREATE_SAFE_EVENTS = {
  CREATE_BUTTON: {
    action: 'Open stepper',
    category: CREATE_SAFE_CATEGORY,
  },
  NAME_SAFE: {
    event: EventType.META,
    action: 'Name Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  OWNERS: {
    event: EventType.META,
    action: 'Owners',
    category: CREATE_SAFE_CATEGORY,
  },
  THRESHOLD: {
    event: EventType.META,
    action: 'Threshold',
    category: CREATE_SAFE_CATEGORY,
  },
  SUBMIT_CREATE_SAFE: {
    event: EventType.META,
    action: 'Submit Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  REJECT_CREATE_SAFE: {
    event: EventType.META,
    action: 'Reject Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  RETRY_CREATE_SAFE: {
    event: EventType.META,
    action: 'Retry Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  CANCEL_CREATE_SAFE: {
    event: EventType.META,
    action: 'Cancel Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  CREATED_SAFE: {
    event: EventType.META,
    action: 'Created Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  GET_STARTED: {
    action: 'Load Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  GO_TO_SAFE: {
    action: 'Open Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  OPEN_HINT: {
    action: 'Open Hint',
    category: CREATE_SAFE_CATEGORY,
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
