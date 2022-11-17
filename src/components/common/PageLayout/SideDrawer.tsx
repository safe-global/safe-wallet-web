import { useEffect, type ReactElement } from 'react'
import { IconButton, Drawer, useMediaQuery } from '@mui/material'
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

const isAppShareRoute = (pathname: string): boolean => {
  return pathname === AppRoutes.share.safeApp
}

const isSafeAppRoute = (pathname: string, query: ParsedUrlQuery): boolean => {
  return pathname === AppRoutes.apps && !!query.appUrl
}

const SideDrawer = ({ isOpen, onToggle }: SideDrawerProps): ReactElement => {
  const { pathname, query } = useRouter()
  const isSmallScreen = useMediaQuery('(max-width: 900px)')
  const showSidebarToggle = isSafeAppRoute(pathname, query)

  useEffect(() => {
    onToggle(!isSmallScreen && !isAppShareRoute(pathname))
  }, [isSmallScreen, pathname, onToggle])

  return (
    <>
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        anchor="left"
        open={isOpen}
        onClose={() => onToggle(false)}
      >
        <Sidebar />
      </Drawer>

      {showSidebarToggle && (
        <div
          className={classnames(css.sidebarToggle, isOpen && css.sidebarOpen)}
          role="button"
          onClick={() => onToggle(!isOpen)}
        >
          <IconButton aria-label="collapse sidebar" size="small">
            {isOpen ? <DoubleArrowLeftIcon fontSize="inherit" /> : <DoubleArrowRightIcon fontSize="inherit" />}
          </IconButton>
        </div>
      )}
    </>
  )
}

export default SideDrawer
