/**
 * Google Tag Manager-related functions.
 *
 * Initializes and un-initializes GTM in production or dev mode.
 * Allows sending datalayer events to GTM.
 *
 * This service should NOT be used directly by components. Use the `analytics` service instead.
 */

import type { TagManagerArgs } from './TagManager'
import TagManager from './TagManager'
import {
  IS_PRODUCTION,
  GOOGLE_TAG_MANAGER_ID,
  GOOGLE_TAG_MANAGER_AUTH_LIVE,
  GOOGLE_TAG_MANAGER_AUTH_LATEST,
  GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH,
} from '@/config/constants'
import type { AnalyticsEvent, EventLabel, SafeAppSDKEvent } from './types'
import { EventType } from './types'
import { SAFE_APPS_SDK_CATEGORY } from './events'
import { getAbTest } from '../tracking/abTesting'
import type { AbTest } from '../tracking/abTesting'

type GTMEnvironment = 'LIVE' | 'LATEST' | 'DEVELOPMENT'
type GTMEnvironmentArgs = Required<Pick<TagManagerArgs, 'auth' | 'preview'>>

const GTM_ENV_AUTH: Record<GTMEnvironment, GTMEnvironmentArgs> = {
  LIVE: {
    auth: GOOGLE_TAG_MANAGER_AUTH_LIVE,
    preview: 'env-1',
  },
  LATEST: {
    auth: GOOGLE_TAG_MANAGER_AUTH_LATEST,
    preview: 'env-2',
  },
  DEVELOPMENT: {
    auth: GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH,
    preview: 'env-3',
  },
}

let _chainId: string = ''

export const gtmSetChainId = (chainId: string): void => {
  _chainId = chainId
}

export const gtmInit = (pagePath: string): void => {
  const GTM_ENVIRONMENT = IS_PRODUCTION ? GTM_ENV_AUTH.LIVE : GTM_ENV_AUTH.DEVELOPMENT

  if (!GOOGLE_TAG_MANAGER_ID || !GTM_ENVIRONMENT.auth) {
    console.warn('[GTM] - Unable to initialize Google Tag Manager. `id` or `gtm_auth` missing.')
    return
  }

  TagManager.initialize({
    gtmId: GOOGLE_TAG_MANAGER_ID,
    ...GTM_ENVIRONMENT,
    dataLayer: {
      pageLocation: `${location.origin}${pagePath}`,
      pagePath,
      // Block JS variables and custom scripts
      // @see https://developers.google.com/tag-platform/tag-manager/web/restrict
      'gtm.blocklist': ['j', 'jsm', 'customScripts'],
    },
  })
}

export const gtmClear = TagManager.disable

type GtmEvent = {
  event: EventType
  chainId: string
  abTest?: AbTest
}

type ActionGtmEvent = GtmEvent & {
  eventCategory: string
  eventAction: string
  eventLabel?: EventLabel
  eventType?: EventType
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
    event: eventData.event || EventType.CLICK,
    chainId: _chainId,
    eventCategory: eventData.category,
    eventAction: eventData.action,
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

export const gtmTrackPageview = (pagePath: string): void => {
  const gtmEvent: PageviewGtmEvent = {
    event: EventType.PAGEVIEW,
    chainId: _chainId,
    pageLocation: `${location.origin}${pagePath}`,
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
  const safeAppGtmEvent: SafeAppGtmEvent = {
    event: EventType.SAFE_APP,
    chainId: _chainId,
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
