import { GTM_EVENT } from '@/services/analytics/analytics'

// TODO: Track forward/backward in stepper. It was done automatically in safe-react

const CREATE_SAFE_CATEGORY = 'create-safe'

export const CREATE_SAFE_EVENTS = {
  CREATE_BUTTON: {
    action: 'Open stepper',
    category: CREATE_SAFE_CATEGORY,
  },
  NAME_SAFE: {
    event: GTM_EVENT.META,
    action: 'Name Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  OWNERS: {
    event: GTM_EVENT.META,
    action: 'Owners',
    category: CREATE_SAFE_CATEGORY,
  },
  THRESHOLD: {
    event: GTM_EVENT.META,
    action: 'Threshold',
    category: CREATE_SAFE_CATEGORY,
  },
  SUBMIT_CREATE_SAFE: {
    event: GTM_EVENT.META,
    action: 'Submit Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  REJECT_CREATE_SAFE: {
    event: GTM_EVENT.META,
    action: 'Reject Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  RETRY_CREATE_SAFE: {
    event: GTM_EVENT.META,
    action: 'Retry Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  CANCEL_CREATE_SAFE: {
    event: GTM_EVENT.META,
    action: 'Cancel Safe creation',
    category: CREATE_SAFE_CATEGORY,
  },
  CREATED_SAFE: {
    event: GTM_EVENT.META,
    action: 'Created Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  // TODO: Is covered by GO_TO_SAFE in web-core
  GET_STARTED: {
    action: 'Load Safe',
    category: CREATE_SAFE_CATEGORY,
  },
  GO_TO_SAFE: {
    action: 'Open Safe',
    category: CREATE_SAFE_CATEGORY,
  },
}

const LOAD_SAFE_CATEGORY = 'load-safe'

export const LOAD_SAFE_EVENTS = {
  LOAD_BUTTON: {
    action: 'Open stepper',
    category: LOAD_SAFE_CATEGORY,
  },
  NAME_SAFE: {
    event: GTM_EVENT.META,
    action: 'Name Safe',
    category: LOAD_SAFE_CATEGORY,
  },
  OWNERS: {
    event: GTM_EVENT.META,
    action: 'Owners',
    category: LOAD_SAFE_CATEGORY,
  },
  THRESHOLD: {
    event: GTM_EVENT.META,
    action: 'Threshold',
    category: LOAD_SAFE_CATEGORY,
  },
  GO_TO_SAFE: {
    action: 'Open Safe',
    category: LOAD_SAFE_CATEGORY,
  },
}
