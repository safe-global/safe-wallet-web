import { useState, type ReactElement } from 'react'
import { Box, Divider, Drawer, IconButton } from '@mui/material'
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
    <Box className={css.container} sx={{ backgroundColor: 'background.paper' }}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>
      <IconButton
        className={css.drawerButton}
        onClick={onDrawerToggle}
        sx={({ palette }) => ({
          backgroundColor: palette.primaryGray[400],
          '&:hover': {
            backgroundColor: palette.primaryGreen[200],
          },
        })}
      >
        <ChevronRight />
      </IconButton>
      {/* For routes with a Safe address */}
      {address ? (
        <>
          <SidebarHeader />

          <Divider sx={({ palette }) => ({ borderColor: palette.primaryGray[400] })} />

          <SidebarNavigation />
        </>
      ) : (
        <div className={css.noSafeSidebar} />
      )}
      <div style={{ flexGrow: 1 }} />

      <Divider flexItem sx={({ palette }) => ({ borderColor: palette.primaryGray[400] })} />

      <SidebarFooter />

      <Drawer variant="temporary" anchor="left" open={isDrawerOpen} onClose={onDrawerToggle}>
        <div className={css.drawer}>
          <SafeList closeDrawer={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>
    </Box>
  )
}

export default Sidebar
