import { useState, type ReactElement } from 'react'
import { Box, Divider, Drawer, IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

import css from './styles.module.css'
import useSafeInfo from '@/services/useSafeInfo'
import ChainIndicator from '../ChainIndicator'
import SidebarHeader from '../SidebarHeader'
import SafeList from '@/components/common/SafeList'
import SidebarNavigation from '@/components/common/SidebarNavigation'
import useSafeAddress from '@/services/useSafeAddress'
import SidebarFooter from '../SidebarFooter'

const Sidebar = (): ReactElement => {
  const address = useSafeAddress()
  const { error, loading } = useSafeInfo()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const onDrawerToggle = () => {
    setIsDrawerOpen((prev) => !prev)
  }

  return (
    <Box className={css.container} sx={{ backgroundColor: 'background.paper' }}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>
      <IconButton
        className={css.drawerButton}
        onClick={onDrawerToggle}
        sx={(theme) => ({ backgroundColor: theme.palette.gray[500] })}
      >
        <ChevronRight />
      </IconButton>
      {/* For routes with a Safe address */}
      {address ? (
        <>
          {!error && <SidebarHeader />}

          <Divider />

          <SidebarNavigation />

          {loading && 'Loading Safe info...'}

          {error && 'Failed loading the Safe'}
        </>
      ) : (
        <div className={css.noSafeSidebar} />
      )}
      <div style={{ flexGrow: 1 }} />

      <Divider flexItem />

      <SidebarFooter />

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div className={css.drawer}>
          <SafeList />
        </div>
      </Drawer>
    </Box>
  )
}

export default Sidebar
