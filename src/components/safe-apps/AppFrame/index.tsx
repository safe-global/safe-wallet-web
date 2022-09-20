import { ReactElement, useCallback, useEffect } from 'react'
import { CircularProgress, Typography } from '@mui/material'
import { trackSafeAppOpenCount } from '@/services/safe-apps/track-app-usage-count'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isSameUrl } from '@/utils/url'
import { ThirdPartyCookiesWarning } from './ThirdPartyCookiesWarning'
import useThirdPartyCookies from './useThirdPartyCookies'
import useAppIsLoading from './useAppIsLoading'
import useAppCommunicator from './useAppCommunicator'

import css from './styles.module.css'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import TransactionQueueBar from '@/components/safe-apps/TransactionQueueBar'

type AppFrameProps = {
  appUrl: string
}

const AppFrame = ({ appUrl }: AppFrameProps): ReactElement => {
  const { safe } = useSafeInfo()

  const [remoteApp] = useSafeAppFromBackend(appUrl, safe.chainId)
  const { safeApp: safeAppFromManifest } = useSafeAppFromManifest(appUrl, safe.chainId)
  const { thirdPartyCookiesDisabled, setThirdPartyCookiesDisabled } = useThirdPartyCookies()
  const { iframeRef, appIsLoading, isLoadingSlow, setAppIsLoading } = useAppIsLoading()

  useAppCommunicator(iframeRef, safeAppFromManifest)

  useEffect(() => {
    if (!remoteApp) return

    trackSafeAppOpenCount(remoteApp.id)
  }, [remoteApp])

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || !isSameUrl(iframe.src, appUrl)) {
      return
    }

    setAppIsLoading(false)
  }, [appUrl, iframeRef, setAppIsLoading])

  return (
    <>
      <div className={css.wrapper}>
        {thirdPartyCookiesDisabled && <ThirdPartyCookiesWarning onClose={() => setThirdPartyCookiesDisabled(false)} />}

        {appIsLoading && (
          <div className={css.loadingContainer}>
            {isLoadingSlow && (
              <Typography variant="h4" gutterBottom>
                The Safe App is taking too long to load, consider refreshing.
              </Typography>
            )}
            <CircularProgress size={48} color="primary" />
          </div>
        )}

        <iframe
          className={css.iframe}
          id={`iframe-${appUrl}`}
          ref={iframeRef}
          src={appUrl}
          title={safeAppFromManifest?.name}
          onLoad={onIframeLoad}
          allow="camera"
          style={{ display: appIsLoading ? 'none' : 'block', border: 'none' }}
        />
      </div>
      <TransactionQueueBar />
    </>
  )
}

export default AppFrame
