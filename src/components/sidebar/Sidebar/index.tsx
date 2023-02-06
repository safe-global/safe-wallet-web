import { useState, type ReactElement } from 'react'
import { Divider, Drawer, IconButton } from '@mui/material'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useRouter } from 'next/router'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import SidebarFooter from '@/components/sidebar/SidebarFooter'

import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import OwnedSafes from '../OwnedSafes'

const Sidebar = (): ReactElement => {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const isSafeRoute = !!router.query?.safe

  const onDrawerToggle = () => {
    trackEvent({ ...OVERVIEW_EVENTS.SIDEBAR, label: isDrawerOpen ? 'Close' : 'Open' })
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <div className={css.container}>
      <div className={css.scroll}>
            <SafeList />
      </div>
    </div>
  )
}

export default Sidebar
