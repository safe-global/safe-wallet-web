import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import { Drawer, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, type ReactElement } from 'react'

import Sidebar from '@/components/sidebar/Sidebar'
import useDebounce from '@/hooks/useDebounce'
import { useIsSidebarRoute } from '@/hooks/useIsSidebarRoute'
import classnames from 'classnames'
import css from './styles.module.css'

type SideDrawerProps = {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
}

const SideDrawer = ({ isOpen, onToggle }: SideDrawerProps): ReactElement => {
  const { breakpoints } = useTheme()
  const isSmallScreen = useMediaQuery(breakpoints.down('md'))
  const [, isSafeAppRoute] = useIsSidebarRoute()
  const showSidebarToggle = isSafeAppRoute && !isSmallScreen
  // Keep the sidebar hidden on small screens via CSS until we collapse it via JS.
  // With a small delay to avoid flickering.
  const smDrawerHidden = useDebounce(!isSmallScreen, 300)

  useEffect(() => {
    const closeSidebar = isSmallScreen || isSafeAppRoute
    onToggle(!closeSidebar)
  }, [isSmallScreen, isSafeAppRoute, onToggle])

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
        <div data-sid="18708" className={classnames(css.sidebarTogglePosition, isOpen && css.sidebarOpen)}>
          <div data-sid="37103" className={css.sidebarToggle} role="button" onClick={() => onToggle(!isOpen)}>
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
