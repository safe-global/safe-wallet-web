export enum GTM_EVENT {
  PAGEVIEW = 'pageview',
  CLICK = 'customClick',
  META = 'metadata',
  SAFE_APP = 'safeApp',
}

export type EventLabel = string | number | boolean | null

export const trackEvent = (eventData: { event: GTM_EVENT; category: string; action: string; label?: EventLabel }) => {
  console.log(eventData)
}
