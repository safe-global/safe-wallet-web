import type { ReactElement } from 'react'

import { useDarkMode } from '@/hooks/useDarkMode'

import css from '@/components/common/AppStoreButton/styles.module.css'

const AppstoreButton = ({ href }: { href: string }): ReactElement => {
  const isDarkMode = useDarkMode()

  return (
    <a href={href} target="_blank" rel="noreferrer">
      <img
        src={isDarkMode ? '/images/appstore-dark.svg' : '/images/appstore.svg'}
        alt="Download on the App Store"
        className={css.button}
      />
    </a>
  )
}

export default AppstoreButton
