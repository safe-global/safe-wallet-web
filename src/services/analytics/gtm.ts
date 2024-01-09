/**
 * Google Tag Manager-related functions.
 *
 * Initializes and un-initializes GTM in production or dev mode.
 * Allows sending datalayer events to GTM.
 *
 * This service should NOT be used directly by components. Use the `analytics` service instead.
 */

import TagManager from './TagManager'
import type { AnalyticsEvent, EventLabel, SafeAppSDKEvent } from './types'
import { EventType, DeviceType } from './types'
import { SAFE_APPS_SDK_CATEGORY } from './events'
import { getAbTest } from '../tracking/abTesting'
import type { AbTest } from '../tracking/abTesting'
import { AppRoutes } from '@/config/routes'
import packageJson from '../../../package.json'

const commonEventParams = {
  appVersion: packageJson.version,
  chainId: '',
  deviceType: DeviceType.DESKTOP,
  safeAddress: '',
}

export const gtmSetChainId = (chainId: string): void => {
  commonEventParams.chainId = chainId
}

export const gtmSetDeviceType = (type: DeviceType): void => {
  commonEventParams.deviceType = type
}

export const gtmSetSafeAddress = (safeAddress: string): void => {
  commonEventParams.safeAddress = safeAddress.slice(2)
}

export const gtmInit = (): void => {
  TagManager.initialize()
}

export const gtmEnableCookies = TagManager.enableCookies
export const gtmDisableCookies = TagManager.disableCookies
export const gtmSetUserProperty = TagManager.setUserProperty

type GtmEvent = {
  event: string
  chainId: string
  deviceType: DeviceType
  abTest?: AbTest
}

type ActionGtmEvent = GtmEvent & {
  eventCategory: string
  eventAction: string
  eventLabel?: EventLabel
  eventType?: string
}

type PageviewGtmEvent = GtmEvent & {
  pageLocation: string
  pagePath: string
}

type SafeAppGtmEvent = ActionGtmEvent & {
  safeAppName: string
  safeAppMethod?: string
  safeAppEthMethod?: string
  safeAppSDKVersion?: string
}

const gtmSend = TagManager.dataLayer

export const gtmTrack = (eventData: AnalyticsEvent): void => {
  const gtmEvent: ActionGtmEvent = {
    ...commonEventParams,
    event: eventData.event || EventType.CLICK,
    eventCategory: eventData.category,
    eventAction: eventData.action,
    chainId: eventData.chainId || commonEventParams.chainId,
  }

  if (eventData.event) {
    gtmEvent.eventType = eventData.event
  } else {
    gtmEvent.eventType = undefined
  }

  if (eventData.label !== undefined) {
    gtmEvent.eventLabel = eventData.label
  } else {
    // Otherwise, whatever was in the datalayer before will be reused
    gtmEvent.eventLabel = undefined
  }

  const abTest = getAbTest()

  if (abTest) {
    gtmEvent.abTest = abTest
  }

  gtmSend(gtmEvent)
}

export const gtmTrackPageview = (pagePath: string, pathWithQuery: string): void => {
  const gtmEvent: PageviewGtmEvent = {
    ...commonEventParams,
    event: EventType.PAGEVIEW,
    pageLocation: `${location.origin}${pathWithQuery}`,
    pagePath,
  }

  gtmSend(gtmEvent)
}

export const normalizeAppName = (appName?: string): string => {
  // App name is a URL
  if (appName?.startsWith('http')) {
    // Strip search query and hash
    return appName.split('?')[0].split('#')[0]
  }
  return appName || ''
}

export const gtmTrackSafeApp = (eventData: AnalyticsEvent, appName?: string, sdkEventData?: SafeAppSDKEvent): void => {
  if (!location.pathname.startsWith(AppRoutes.apps.index)) {
    return
  }

  const safeAppGtmEvent: SafeAppGtmEvent = {
    ...commonEventParams,
    event: EventType.SAFE_APP,
    eventCategory: eventData.category,
    eventAction: eventData.action,
    safeAppName: normalizeAppName(appName),
    safeAppEthMethod: '',
    safeAppMethod: '',
    safeAppSDKVersion: '',
  }

  if (eventData.category === SAFE_APPS_SDK_CATEGORY) {
    safeAppGtmEvent.safeAppMethod = sdkEventData?.method
    safeAppGtmEvent.safeAppEthMethod = sdkEventData?.ethMethod
    safeAppGtmEvent.safeAppSDKVersion = sdkEventData?.version
  }

  if (eventData.label) {
    safeAppGtmEvent.eventLabel = eventData.label
  }

  gtmSend(safeAppGtmEvent)
}
