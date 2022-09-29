import type { ReactElement } from 'react'

import { useDarkMode } from '@/hooks/useDarkMode'
import { MOBILE_APP_EVENTS, trackEvent } from '@/services/analytics'

import css from '@/components/common/AppStoreButton/styles.module.css'

// App Store campaigns track the user interaction
enum LINKS {
  pairing = 'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Connect&mt=8',
  footer = 'https://apps.apple.com/app/apple-store/id1515759131?pt=119497694&ct=Web%20App%20Footer&mt=8',
}

const AppstoreButton = ({ placement }: { placement: keyof typeof LINKS }): ReactElement => {
  const isDarkMode = useDarkMode()

  const onClick = () => {
    trackEvent({
      ...MOBILE_APP_EVENTS.APPSTORE_BUTTON_CLICK,
      label: placement,
    })
  }

  return (
    <a href={LINKS[placement]} target="_blank" rel="noreferrer" onClick={onClick}>
      <img
        src={isDarkMode ? '/images/common/appstore-light.svg' : '/images/common/appstore.svg'}
        alt="Download on the App Store"
        className={css.button}
      />
    </a>
  )
}

export default AppstoreButton
