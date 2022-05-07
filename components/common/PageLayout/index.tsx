import { useState, type ReactElement } from 'react'
import { Box, Drawer } from '@mui/material'

import Sidebar from '@/components/common/Sidebar'
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

      <Box className={css.main}>{children}</Box>
    </div>
  )
}

export default PageLayout
