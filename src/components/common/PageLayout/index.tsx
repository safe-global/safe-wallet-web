import { useEffect, useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import cn from 'classnames'

import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import { AppRoutes } from '@/config/routes'
import { useSafeAppUrl } from '@/hooks/safe-apps/useSafeAppUrl'
import { useMediaQuery } from '@mui/material'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 900px)')

  const [appUrl] = useSafeAppUrl()
  const isSafeAppPage = !!appUrl
  const isShareSafeAppPage = router.pathname === AppRoutes.share.safeApp

  const [isSideBarCollapsed, setIsSideBarCollapsed] = useState<boolean>(isMobile)

  const collapseSideBar = () => setIsSideBarCollapsed((prev) => !prev)
  const showCollapseSidebarButton = isSafeAppPage && !isShareSafeAppPage && !isMobile

  const hideSidebarDesktop = (isShareSafeAppPage || isSafeAppPage) && isSideBarCollapsed
  const hideSidebarMobile = isSideBarCollapsed
  const hideSidebar = isMobile ? hideSidebarMobile : hideSidebarDesktop

  useEffect(() => {
    setIsSideBarCollapsed(true)
  }, [router.pathname, router.query.safe, isMobile])

  return (
    <>
      <Header onMenuToggle={collapseSideBar} />

      <Sidebar
        hideSidebar={hideSidebar}
        showCollapseSidebarButton={showCollapseSidebarButton}
        collapseSideBar={collapseSideBar}
      />

      <div className={cn(css.main, hideSidebar && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
