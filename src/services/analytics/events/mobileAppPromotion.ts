const MOBILE_APP_CATEGORY = 'mobile-app-promotion'
const SURVEY_ACTION = 'dashboard-banner-survey'

export const MOBILE_APP_EVENTS = {
  dashboardBannerClick: {
    action: 'dashboard-banner-click',
    category: MOBILE_APP_CATEGORY,
  },
  alreadyUse: {
    label: 'already-use',
    action: SURVEY_ACTION,
    category: MOBILE_APP_CATEGORY,
  },
  notInterested: {
    label: 'not-interested',
    action: SURVEY_ACTION,
    category: MOBILE_APP_CATEGORY,
  },
  dashboardBannerClose: {
    action: 'dashboard-banner-close',
    category: MOBILE_APP_CATEGORY,
  },
  appstoreButtonClick: {
    action: 'appstore-button-click',
    category: MOBILE_APP_CATEGORY,
  },
}
