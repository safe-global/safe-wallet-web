import { useState, type ReactElement } from 'react'
import { Box, Drawer, Toolbar } from '@mui/material'

import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  const onMenuToggle = (): void => {
    setIsMobileDrawerOpen((prev) => !prev)
  }

  const sidebar = (
    <Sidebar>
      <Toolbar className={css.toolbar} />
    </Sidebar>
  )

  return (
    <div className={css.container}>
      <Header onMenuToggle={onMenuToggle} />

      {/* Desktop sidebar */}
      <Drawer variant="permanent" anchor="left" className={css.drawer}>
        {sidebar}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer
        variant="temporary"
        anchor="left"
        className={css.mobileDrawer}
        open={isMobileDrawerOpen}
        onClose={onMenuToggle}
      >
        {sidebar}
      </Drawer>

      <Box className={css.main}>
        <Toolbar className={css.toolbar} />
        {children}
      </Box>
    </div>
  )
}

export default PageLayout
