import type { MutableRefObject, ReactElement } from 'react'
import classnames from 'classnames'
import css from './styles.module.css'

type SafeAppIFrameProps = {
  appUrl: string
  allowedFeaturesList: string
  title?: string
  iframeRef?: MutableRefObject<HTMLIFrameElement | null>
  onLoad?: () => void
}

// see sandbox mdn docs for more details https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
const IFRAME_SANDBOX_ALLOWED_FEATURES =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-orientation-lock'

const SAFE_DOMAINS = [
  'app.safe.global',
  'safe-wallet-web.dev.5afe.dev',
  '--walletweb.review.5afe.dev',
  'localhost:3000',
]

const SafeAppIframe = ({ appUrl, allowedFeaturesList, iframeRef, onLoad, title }: SafeAppIFrameProps): ReactElement => {
  const { host } = new URL(appUrl)
  const isNestedSafe = SAFE_DOMAINS.some((domain) => host.includes(domain))

  return (
    <iframe
      className={classnames(css.iframe, {
        [css.nestedSafeIframe]: isNestedSafe,
      })}
      id={`iframe-${appUrl}`}
      ref={iframeRef}
      src={appUrl}
      title={title}
      onLoad={onLoad}
      sandbox={IFRAME_SANDBOX_ALLOWED_FEATURES}
      allow={allowedFeaturesList}
    />
  )
}

export default SafeAppIframe
