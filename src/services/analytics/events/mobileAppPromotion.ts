const MOBILE_APP_CATEGORY = 'mobile-app-promotion'
const SURVEY_ACTION = 'dashboard-banner-survey'

// TODO: Does not yet exist in web-core
export const MOBILE_APP_EVENTS = {
  DASHBOARD_BANNER_CLICK: {
    action: 'dashboard-banner-click',
    category: MOBILE_APP_CATEGORY,
  },
  ALREADY_USE: {
    label: 'already-use',
    action: SURVEY_ACTION,
    category: MOBILE_APP_CATEGORY,
  },
  NOT_INTERESTED: {
    label: 'not-interested',
    action: SURVEY_ACTION,
    category: MOBILE_APP_CATEGORY,
  },
  DASHBOARD_BANNER_CLOSE: {
    action: 'dashboard-banner-close',
    category: MOBILE_APP_CATEGORY,
  },
  APPSTORE_BUTTON_CLICK: {
    action: 'appstore-button-click',
    category: MOBILE_APP_CATEGORY,
  },
}
