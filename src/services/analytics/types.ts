export enum EventType {
  PAGEVIEW = 'pageview',
  CLICK = 'customClick',
  META = 'metadata',
  SAFE_APP = 'safeApp',
}

export type EventLabel = string | number | boolean | null

export type AnalyticsEvent = {
  event?: EventType
  category: string
  action: string
  label?: EventLabel
}
