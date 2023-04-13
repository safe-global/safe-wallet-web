import type { MutableRefObject } from 'react'
import { useCallback, useEffect } from 'react'

import type { AnalyticsEvent } from '@/services/analytics'
import { EventType, trackSafeAppEvent } from '@/services/analytics'
import { SAFE_APPS_ANALYTICS_CATEGORY } from '@/services/analytics/events/safeApps'

//TODO: Remove Safe Apps old domain when all migrated to the new one
const ALLOWED_DOMAINS: RegExp[] = [
  /^http:\/\/localhost:[0-9]{4}$/,
  /^https:\/\/safe-apps\.dev\.5afe\.dev$/,
  /^https:\/\/apps\.gnosis-safe\.io$/,
  /^https:\/\/apps-portal\.safe\.global$/,
]

const useAnalyticsFromSafeApp = (iframeRef: MutableRefObject<HTMLIFrameElement | null>): void => {
  const isValidMessage = useCallback(
    (msg: MessageEvent<AnalyticsEvent>) => {
      const isFromIframe = iframeRef.current?.contentWindow === msg.source
      const isCategoryAllowed = msg.data.category === SAFE_APPS_ANALYTICS_CATEGORY
      const isDomainAllowed = ALLOWED_DOMAINS.find((regExp) => regExp.test(msg.origin)) !== undefined

      return isFromIframe && isCategoryAllowed && isDomainAllowed
    },
    [iframeRef],
  )

  const handleIncomingMessage = useCallback(
    (msg: MessageEvent<AnalyticsEvent & { safeAppName: string }>) => {
      if (!isValidMessage(msg)) {
        return
      }

      const { action, label, safeAppName } = msg.data

      trackSafeAppEvent(
        { event: EventType.SAFE_APP, category: SAFE_APPS_ANALYTICS_CATEGORY, action, label },
        safeAppName,
      )
    },
    [isValidMessage],
  )

  useEffect(() => {
    window.addEventListener('message', handleIncomingMessage)

    return () => {
      window.removeEventListener('message', handleIncomingMessage)
    }
  }, [handleIncomingMessage])
}

export default useAnalyticsFromSafeApp
