import type { MutableRefObject } from 'react'
import { useCallback, useEffect } from 'react'

import type { AnalyticsEvent } from '@/services/analytics'
import { EventType } from '@/services/analytics'
import { trackSafeAppEvent } from '@/services/analytics'
import { SAFE_APPS_ANALYTIC_CATEGORY } from '@/services/analytics'

const useAnalyticsFromSafeApp = (iframeRef: MutableRefObject<HTMLIFrameElement | null>): void => {
  const isValidMessage = useCallback(
    (msg: MessageEvent<AnalyticsEvent>) => {
      const sentFromIframe = iframeRef.current?.contentWindow === msg.source
      const allowedCategory = msg.data.category === SAFE_APPS_ANALYTIC_CATEGORY
      const allowedDomains = msg.origin.includes('localhost') // TODO: Add safe apps domains

      return sentFromIframe && allowedCategory && allowedDomains
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
        { event: EventType.SAFE_APP, category: SAFE_APPS_ANALYTIC_CATEGORY, action, label },
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
