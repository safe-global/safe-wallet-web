import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'

const WHATS_NEW_PATH = ''
const HELP_CENTER_PATH = ''

const SidebarFooter = (): ReactElement => {
  const router = useRouter()

  const isSelected = (href: string) => router.pathname === href

  return (
    <SidebarList>
      <SidebarListItemButton
        selected={isSelected(WHATS_NEW_PATH)}
        href={{ pathname: WHATS_NEW_PATH, query: router.query }}
      >
        <SidebarListItemIcon>
          <Image src="/images/sidebar/whats-new.svg" alt="What's New" height="16px" width="16px" />
        </SidebarListItemIcon>
        <SidebarListItemText bold>What&apos;s new</SidebarListItemText>
      </SidebarListItemButton>
      <SidebarListItemButton
        selected={isSelected(HELP_CENTER_PATH)}
        href={{ pathname: HELP_CENTER_PATH, query: router.query }}
      >
        <SidebarListItemIcon>
          <Image src="/images/sidebar/help-center.svg" alt="Help Center" height="16px" width="16px" />
        </SidebarListItemIcon>
        <SidebarListItemText bold>Help Center</SidebarListItemText>
      </SidebarListItemButton>
    </SidebarList>
  )
}

export default SidebarFooter
