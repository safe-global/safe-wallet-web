import { useEffect, type ReactElement } from 'react'
import { IconButton, Drawer, useMediaQuery } from '@mui/material'
import type { ParsedUrlQuery } from 'querystring'
import { useTheme } from '@mui/material/styles'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import { useRouter } from 'next/router'

import classnames from 'classnames'
import Sidebar from '@/components/sidebar/Sidebar'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import useDebounce from '@/hooks/useDebounce'

type SideDrawerProps = {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
}

const isSafeAppFrameRoute = (pathname: string, query: ParsedUrlQuery): boolean => {
  return pathname === AppRoutes.apps.open && !!query.appUrl
}

const SideDrawer = ({ isOpen, onToggle }: SideDrawerProps): ReactElement => {
  const { pathname, query } = useRouter()
  const { breakpoints } = useTheme()
  const isSmallScreen = useMediaQuery(breakpoints.down('md'))
  const showSidebarToggle = isSafeAppFrameRoute(pathname, query) && !isSmallScreen
  // Keep the sidebar hidden on small screens via CSS until we collapse it via JS.
  // With a small delay to avoid flickering.
  const smDrawerHidden = useDebounce(!isSmallScreen, 300)

  useEffect(() => {
    const closeSidebar = isSmallScreen || isSafeAppFrameRoute(pathname, query)
    onToggle(!closeSidebar)
  }, [isSmallScreen, onToggle, pathname, query])

  return (
    <>
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        anchor="left"
        open={isOpen}
        onClose={() => onToggle(false)}
        className={smDrawerHidden ? css.smDrawerHidden : undefined}
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
