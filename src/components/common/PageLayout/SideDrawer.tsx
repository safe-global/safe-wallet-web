import { useEffect, type ReactElement } from 'react'
import { IconButton, Drawer, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import { useRouter } from 'next/router'
import classnames from 'classnames'
import { type ParsedUrlQuery } from 'querystring'

import Sidebar from '@/components/sidebar/Sidebar'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'

type SideDrawerProps = {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
}

const isNewSafeRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.newSafe.create
}

const isAppShareRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.share.safeApp
}

const isSafeAppRoute = (pathname: string, query: ParsedUrlQuery): boolean => {
  return pathname === AppRoutes.apps && !!query.appUrl
}

const SideDrawer = ({ isOpen, onToggle }: SideDrawerProps): ReactElement => {
  const { pathname, query } = useRouter()
  const { breakpoints } = useTheme()
  const isSmallScreen = useMediaQuery(`(max-width: ${breakpoints.values.md}px)`)
  const showSidebarToggle = isSafeAppRoute(pathname, query) && !isSmallScreen

  useEffect(() => {
    const closeSidebar =
      isSmallScreen || isSafeAppRoute(pathname, query) || isAppShareRoute(pathname) || isNewSafeRoute(pathname)
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
