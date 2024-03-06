import ChevronRight from '@mui/icons-material/ChevronRight'
import { Box, Divider, Drawer } from '@mui/material'
import { useCallback, useState, type ReactElement } from 'react'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarFooter from '@/components/sidebar/SidebarFooter'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'

import MyAccounts from '@/components/welcome/MyAccounts'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const onDrawerToggle = useCallback(() => {
    setIsDrawerOpen((isOpen) => {
      trackEvent({ ...OVERVIEW_EVENTS.SIDEBAR, label: isOpen ? 'Close' : 'Open' })

      return !isOpen
    })
  }, [])

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return (
    <div data-sid="58595" data-testid="sidebar-container" className={css.container}>
      <div data-sid="66982" className={css.scroll}>
        <ChainIndicator showLogo={false} />

        {/* Open the safes list */}
        <button data-testid="open-safes-icon" className={css.drawerButton} onClick={onDrawerToggle}>
          <ChevronRight />
        </button>

        {/* Address, balance, copy button, etc */}
        <SidebarHeader />

        <Divider />

        {/* Nav menu */}
        <SidebarNavigation />

        <Box data-sid="67647" flex={1} />

        <Divider flexItem />

        {/* What's new + Need help? */}
        <SidebarFooter />
      </div>

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div data-sid="75989" className={css.drawer}>
          <MyAccounts onLinkClick={closeDrawer}></MyAccounts>
        </div>
      </Drawer>
    </div>
  )
}

export default Sidebar
