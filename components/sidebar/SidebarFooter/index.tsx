import { ReactElement, useCallback, useEffect } from 'react'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { BEAMER_SELECTOR, isBeamerLoaded, loadBeamer } from '@/services/beamer'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectCookies, CookieType } from '@/store/cookiesSlice'
import { openCookieBanner } from '@/store/popupSlice'

const WHATS_NEW_PATH = 'https://help.gnosis-safe.io/en/'

const SidebarFooter = (): ReactElement => {
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)

  const hasBeamerConsent = useCallback(() => cookies[CookieType.UPDATES_COOKIE], [cookies])

  useEffect(() => {
    // Initialise Beamer when consent was previously given
    if (hasBeamerConsent() && !isBeamerLoaded()) {
      loadBeamer()
    }
  }, [hasBeamerConsent])

  const handleBeamer = () => {
    if (!hasBeamerConsent()) {
      dispatch(openCookieBanner({ warningKey: CookieType.UPDATES_COOKIE }))
    }
  }

  return (
    <SidebarList>
      <SidebarListItemButton id={BEAMER_SELECTOR} onClick={handleBeamer}>
        <SidebarListItemIcon>
          {/* 
          // TODO: Include thick icon from design */}
          <img src="/images/sidebar/whats-new.svg" alt="What's New" height="16px" width="16px" />
        </SidebarListItemIcon>
        <SidebarListItemText bold>What&apos;s New</SidebarListItemText>
      </SidebarListItemButton>
      <a target="_blank" rel="noopener noreferrer" href={WHATS_NEW_PATH}>
        <SidebarListItemButton>
          <SidebarListItemIcon>
            <img src="/images/sidebar/help-center.svg" alt="Help Center" height="16px" width="16px" />
          </SidebarListItemIcon>
          <SidebarListItemText bold>Need Help?</SidebarListItemText>
        </SidebarListItemButton>
      </a>
    </SidebarList>
  )
}

export default SidebarFooter
