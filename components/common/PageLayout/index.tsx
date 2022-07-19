import { useState, type ReactElement } from 'react'
import { Box, Drawer } from '@mui/material'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'

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

      <Box className={css.main}>
        <SafeLoadingError>{children}</SafeLoadingError>
      </Box>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}

export default PageLayout
