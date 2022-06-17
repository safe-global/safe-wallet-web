import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import HelpCenter from './assets/HelpCenter.svg'
import WhatsNew from './assets/WhatsNew.svg'

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
          <Image src={WhatsNew} alt="What's New" />
        </SidebarListItemIcon>
        <SidebarListItemText bold>What&apos;s new</SidebarListItemText>
      </SidebarListItemButton>
      <SidebarListItemButton
        selected={isSelected(HELP_CENTER_PATH)}
        href={{ pathname: HELP_CENTER_PATH, query: router.query }}
      >
        <SidebarListItemIcon>
          <Image src={HelpCenter} alt="Help Center" />
        </SidebarListItemIcon>
        <SidebarListItemText bold>Help Center</SidebarListItemText>
      </SidebarListItemButton>
    </SidebarList>
  )
}

export default SidebarFooter
