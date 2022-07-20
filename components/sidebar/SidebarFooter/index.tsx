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
import BeamerIcon from '@/public/images/sidebar/whats-new.svg'
import HelpCenterIcon from '@/public/images/sidebar/help-center.svg'
import { ListItem } from '@mui/material'

const WHATS_NEW_PATH = 'https://help.gnosis-safe.io/en/'

const SidebarFooter = (): ReactElement => {
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)

  const hasBeamerConsent = useCallback(() => cookies[CookieType.UPDATES], [cookies])

  useEffect(() => {
    // Initialise Beamer when consent was previously given
    if (hasBeamerConsent() && !isBeamerLoaded()) {
      loadBeamer()
    }
  }, [hasBeamerConsent])

  const handleBeamer = () => {
    if (!hasBeamerConsent()) {
      dispatch(openCookieBanner({ warningKey: CookieType.UPDATES }))
    }
  }

  return (
    <SidebarList>
      <ListItem disablePadding>
        <SidebarListItemButton id={BEAMER_SELECTOR} onClick={handleBeamer}>
          <SidebarListItemIcon>
            <BeamerIcon />
          </SidebarListItemIcon>
          <SidebarListItemText bold>What&apos;s New</SidebarListItemText>
        </SidebarListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <a target="_blank" rel="noopener noreferrer" href={WHATS_NEW_PATH} style={{ width: '100%' }}>
          <SidebarListItemButton>
            <SidebarListItemIcon>
              <HelpCenterIcon />
            </SidebarListItemIcon>
            <SidebarListItemText bold>Need Help?</SidebarListItemText>
          </SidebarListItemButton>
        </a>
      </ListItem>
    </SidebarList>
  )
}

export default SidebarFooter
