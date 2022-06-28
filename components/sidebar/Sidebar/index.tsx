import { useState, type ReactElement } from 'react'
import { Box, Divider, Drawer, IconButton } from '@mui/material'
import { ChevronRight } from '@mui/icons-material'

import useSafeInfo from '@/hooks/useSafeInfo'
import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import useSafeAddress from '@/hooks/useSafeAddress'
import SidebarFooter from '@/components/sidebar/SidebarFooter'
import useAddressBook from '@/hooks/useAddressBook'

import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const address = useSafeAddress()
  const { error, loading } = useSafeInfo()
  const addressBook = useAddressBook()
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

  const name = addressBook?.[address] || ''

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
        sx={(theme) => ({ backgroundColor: theme.palette.gray[500], top: name ? '88px' : '40px' })}
      >
        <ChevronRight />
      </IconButton>
      {/* For routes with a Safe address */}
      {address ? (
        <>
          {!error && <SidebarHeader name={name} />}

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
          <SafeList closeDrawer={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>
    </Box>
  )
}

export default Sidebar
