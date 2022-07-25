import { useState, type ReactElement } from 'react'
import { Divider, Drawer, IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import useSafeAddress from '@/hooks/useSafeAddress'
import SidebarFooter from '@/components/sidebar/SidebarFooter'

import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const address = useSafeAddress()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const onDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <div className={css.container}>
      <div className={css.scroll}>
        <div className={css.chain}>
          <ChainIndicator />
        </div>

        <IconButton className={css.drawerButton} onClick={onDrawerToggle}>
          <ChevronRight />
        </IconButton>

        {/* For routes with a Safe address */}
        {address ? (
          <>
            <SidebarHeader />

            <Divider />

            <SidebarNavigation />
          </>
        ) : (
          <div className={css.noSafeSidebar} />
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
