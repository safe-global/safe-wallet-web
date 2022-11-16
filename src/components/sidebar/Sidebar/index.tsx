import { useState, type ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import ChevronRight from '@mui/icons-material/ChevronRight'
import useMediaQuery from '@mui/material/useMediaQuery'
import Tooltip from '@mui/material/Tooltip'
import DoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import DoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import { useRouter } from 'next/router'

import ChainIndicator from '@/components/common/ChainIndicator'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SafeList from '@/components/sidebar/SafeList'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation'
import SidebarFooter from '@/components/sidebar/SidebarFooter'

import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import OwnedSafes from '../OwnedSafes'

type SidebarProps = {
  isSidebarHidden: boolean
  showCollapseSidebarButton: boolean
  collapseSidebar: () => void
}

const Sidebar = ({ isSidebarHidden, showCollapseSidebarButton, collapseSidebar }: SidebarProps): ReactElement => {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 900px)')

  const [isSafeListOpen, setIsSafeListOpen] = useState<boolean>(false)

  const isSafeRoute = !!router.query?.safe

  const onToggleSafeList = () => {
    trackEvent({ ...OVERVIEW_EVENTS.SIDEBAR, label: isSafeListOpen ? 'Close' : 'Open' })
    setIsSafeListOpen((prev) => !prev)
  }

  return (
    <>
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={!isSidebarHidden}
        onClose={collapseSidebar}
        PaperProps={{ style: { overflow: 'visible' } }}
      >
        <aside className={css.container}>
          <div className={css.scroll}>
            <ChainIndicator />

            <IconButton className={css.drawerButton} onClick={onToggleSafeList}>
              <ChevronRight />
            </IconButton>

            {isSafeRoute ? (
              <>
                <SidebarHeader />
                <Divider />
                <SidebarNavigation />
              </>
            ) : (
              <>
                <div className={css.noSafeHeader}>
                  <KeyholeIcon />
                </div>

                <OwnedSafes />
              </>
            )}

            <div style={{ flexGrow: 1 }} />

            <Divider flexItem />

            <SidebarFooter />
          </div>

          <Drawer variant="temporary" anchor="left" open={isSafeListOpen} onClose={onToggleSafeList}>
            <div className={css.drawer}>
              <SafeList closeDrawer={() => setIsSafeListOpen(false)} />
            </div>
          </Drawer>
        </aside>
        {showCollapseSidebarButton && (
          <Tooltip title={isSidebarHidden ? 'Open sidebar' : 'Close sidebar'} placement="right" followCursor={true}>
            <div onClick={collapseSidebar} className={css.collapseSidebarBar} role="button">
              <IconButton className={css.collapseSidebarBarButton} aria-label="collapse sidebar" size="small">
                {isSidebarHidden ? (
                  <DoubleArrowRightIcon fontSize="inherit" />
                ) : (
                  <DoubleArrowLeftIcon fontSize="inherit" />
                )}
              </IconButton>
            </div>
          </Tooltip>
        )}
      </Drawer>
    </>
  )
}

export default Sidebar
