import { useEffect, type ReactElement } from 'react'
import { IconButton, Drawer, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import { useRouter } from 'next/router'
import classnames from 'classnames'

import Sidebar from '@/components/sidebar/Sidebar'
import css from './styles.module.css'
import { isSafeAppRoute } from '@/utils/route'

type SideDrawerProps = {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
}

const SideDrawer = ({ isOpen, onToggle }: SideDrawerProps): ReactElement => {
  const { pathname, query } = useRouter()
  const { breakpoints } = useTheme()
  const isSmallScreen = useMediaQuery(`(max-width: ${breakpoints.values.md}px)`)
  const showSidebarToggle = isSafeAppRoute(pathname, query) && !isSmallScreen

  useEffect(() => {
    const closeSidebar = isSmallScreen || isSafeAppRoute(pathname, query)
    onToggle(!closeSidebar)
  }, [isSmallScreen, onToggle, pathname, query])

  return (
    <>
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        anchor="left"
        open={isOpen}
        onClose={() => onToggle(false)}
      >
        <aside>
          <Sidebar />
        </aside>
      </Drawer>

      {showSidebarToggle && (
        <div className={classnames(css.sidebarTogglePosition, isOpen && css.sidebarOpen)}>
          <div className={css.sidebarToggle} role="button" onClick={() => onToggle(!isOpen)}>
            <IconButton aria-label="collapse sidebar" size="small" disableRipple>
              {isOpen ? <DoubleArrowLeftIcon fontSize="inherit" /> : <DoubleArrowRightIcon fontSize="inherit" />}
            </IconButton>
          </div>
        </div>
      )}
    </>
  )
}

export default SideDrawer
