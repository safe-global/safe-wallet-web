/**
 * Google Tag Manager-related functions.
 *
 * Initializes and un-initializes GTM in production or dev mode.
 * Allows sending datalayer events to GTM.
 *
 * This service should NOT be used directly by components. Use the `analytics` service instead.
 */

import type { TagManagerArgs } from './TagManager'
import TagManager, { DATA_LAYER_NAME } from './TagManager'
import Cookies from 'js-cookie'
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

type GTMEnvironment = 'LIVE' | 'LATEST' | 'DEVELOPMENT'
type GTMEnvironmentArgs = Required<Pick<TagManagerArgs, 'auth' | 'preview'>>

const GOOGLE_ANALYTICS_COOKIE_LIST = ['_ga', '_gat', '_gid']
const EMPTY_SAFE_APP = 'unknown'

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

const isGtmLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window[DATA_LAYER_NAME]
}

export const gtmClear = (): void => {
  if (!isGtmLoaded()) return

  // Delete GA cookies
  const path = '/'
  const domain = `.${location.host.split('.').slice(-2).join('.')}`
  GOOGLE_ANALYTICS_COOKIE_LIST.forEach((cookie) => {
    Cookies.remove(cookie, { path, domain })
  })
}

type GtmEvent = {
  event: EventType
  chainId: string
}

type ActionGtmEvent = GtmEvent & {
  eventCategory: string
  eventAction: string
  eventLabel?: EventLabel
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

const gtmSend = (event: GtmEvent): void => {
  console.info('[Analytics]', event)

  if (!isGtmLoaded()) return

  TagManager.dataLayer(event)
}

export const gtmTrack = (eventData: AnalyticsEvent): void => {
  const gtmEvent: ActionGtmEvent = {
    event: eventData.event || EventType.CLICK,
    chainId: _chainId,
    eventCategory: eventData.category,
    eventAction: eventData.action,
  }

  if (eventData.label) {
    gtmEvent.eventLabel = eventData.label
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

export const gtmTrackSafeApp = (eventData: AnalyticsEvent, appName?: string, sdkEventData?: SafeAppSDKEvent): void => {
  const safeAppGtmEvent: SafeAppGtmEvent = {
    event: EventType.SAFE_APP,
    chainId: _chainId,
    eventCategory: eventData.category,
    eventAction: eventData.action,
    safeAppName: appName || '',
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
