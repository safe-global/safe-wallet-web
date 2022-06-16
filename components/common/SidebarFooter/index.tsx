import { useRouter } from 'next/router'
import type { ReactElement } from 'react'

import { SidebarList, SidebarListItemButton, SidebarListItemIcon, SidebarListItemText } from '../SidebarList'

const SidebarFooter = (): ReactElement => {
  const router = useRouter()

  const isSelected = (href: string) => router.pathname === href

  return (
    <SidebarList>
      <SidebarListItemButton selected={isSelected('')} href={{ pathname: '', query: router.query }}>
        <SidebarListItemIcon>{null}</SidebarListItemIcon>
        <SidebarListItemText bold>What's new</SidebarListItemText>
      </SidebarListItemButton>
      <SidebarListItemButton selected={isSelected('')} href={{ pathname: '', query: router.query }}>
        <SidebarListItemIcon>{null}</SidebarListItemIcon>
        <SidebarListItemText bold>Help Center</SidebarListItemText>
      </SidebarListItemButton>
    </SidebarList>
  )
}

export default SidebarFooter
