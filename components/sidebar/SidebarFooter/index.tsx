import { ReactElement, useEffect } from 'react'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { BEAMER_SELECTOR, loadBeamer } from '@/services/beamer'

const WHATS_NEW_PATH = 'https://help.gnosis-safe.io/en/'

const SidebarFooter = (): ReactElement => {
  useEffect(() => {
    // TODO: Based on cookies, (un-)load Beamer
    loadBeamer()
  }, [])

  return (
    <SidebarList>
      <SidebarListItemButton id={BEAMER_SELECTOR}>
        <SidebarListItemIcon>
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
