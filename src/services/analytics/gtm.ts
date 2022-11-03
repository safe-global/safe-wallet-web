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
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import {
  IS_PRODUCTION,
  GOOGLE_TAG_MANAGER_ID,
  GOOGLE_TAG_MANAGER_AUTH_LIVE,
  GOOGLE_TAG_MANAGER_AUTH_LATEST,
  GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH,
} from '@/config/constants'
import type { AnalyticsEvent, EventLabel, SafeAppEvent } from './types'
import { EventType } from './types'

type GTMEnvironment = 'LIVE' | 'LATEST' | 'DEVELOPMENT'
type GTMEnvironmentArgs = Required<Pick<TagManagerArgs, 'auth' | 'preview'>>

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

export const gtmClear = TagManager.destroy

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

const gtmSend = TagManager.dataLayer

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

export const gtmTrackSafeAppMessage = ({
  app,
  method,
  params,
  sdkVersion,
}: {
  app?: SafeAppData
  method: string
  params?: any
  sdkVersion?: string
}): void => {
  const gtmEvent: SafeAppEvent = {
    event: EventType.SAFE_APP,
    chainId: _chainId,
    safeAppName: app?.name || EMPTY_SAFE_APP,
    safeAppMethod: method,
    safeAppEthMethod: params?.call,
    safeAppSDKVersion: sdkVersion,
  }

  gtmSend(gtmEvent)
}
