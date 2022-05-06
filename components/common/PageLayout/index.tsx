import { type ReactElement } from 'react'
import { Box, Drawer, Toolbar } from '@mui/material'

import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  return (
    <div className={css.container}>
      <Header />

      <Drawer variant="permanent" anchor="left" className={css.drawer}>
        <Toolbar />
        <Sidebar />
      </Drawer>

      <Box className={css.main} sx={{ backgroundColor: (theme) => theme.palette.background }}>
        <Toolbar />
        {children}
      </Box>
    </div>
  )
}

export default PageLayout
