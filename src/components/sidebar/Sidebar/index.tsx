import { useState, type ReactElement } from 'react'
import { Divider, Drawer, IconButton } from '@mui/material'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { useRouter } from 'next/router'
import classnames from 'classnames'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import SidebarFooter from '@/components/sidebar/SidebarFooter'

import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { trackEvent } from '@/services/analytics/analytics'

const Sidebar = (): ReactElement => {
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  // Routes with a Safe address in query
  const isSafeRoute = router.pathname.startsWith(AppRoutes.safe.index)

  const onDrawerToggle = () => {
    trackEvent({ ...OVERVIEW_EVENTS.SIDEBAR, label: isDrawerOpen ? 'Close' : 'Open' })
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <div className={classnames(css.container, { [css.noSafe]: !isSafeRoute })}>
      <div className={css.scroll}>
        <div className={css.chain}>
          <ChainIndicator />
        </div>

        <IconButton className={css.drawerButton} onClick={onDrawerToggle}>
          <ChevronRight />
        </IconButton>

        {isSafeRoute ? (
          <>
            <SidebarHeader />
            <Divider />
            <SidebarNavigation />
          </>
        ) : (
          <div className={css.noSafeHeader} />
        )}

        <div style={{ flexGrow: 1 }} />

        <Divider flexItem />

        <SidebarFooter />
      </div>

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div className={css.drawer}>
          <SafeList closeDrawer={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>
    </div>
  )
}

export default Sidebar
