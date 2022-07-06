import { useState, type ReactElement } from 'react'
import { Box, Drawer } from '@mui/material'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false)

  const onMenuToggle = (): void => {
    setIsMobileDrawerOpen((prev) => !prev)
  }

  const sidebar = <Sidebar />

  return (
    <div className={css.container}>
      <header>
        <Header onMenuToggle={onMenuToggle} />
      </header>

      {/* Desktop sidebar */}
      <aside className={css.sidebar}>{sidebar}</aside>

      {/* Mobile sidebar */}
      <Drawer variant="temporary" anchor="left" open={isMobileDrawerOpen} onClose={onMenuToggle}>
        {sidebar}
      </Drawer>

      <Box className={css.main} sx={({ palette }) => ({ backgroundColor: palette.gray.background })}>
        {children}
      </Box>
    </div>
  )
}

export default PageLayout
