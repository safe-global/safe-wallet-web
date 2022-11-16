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
  const isSafeAppPage = !!appUrl && router.pathname === AppRoutes.apps
  const isShareSafeAppPage = router.pathname === AppRoutes.share.safeApp

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(isMobile)

  const collapseSidebar = () => setIsSidebarCollapsed((prev) => !prev)
  const showCollapseSidebarButton = isSafeAppPage && !isMobile

  const isSidebarHiddenDesktop = (isShareSafeAppPage || isSafeAppPage) && isSidebarCollapsed
  const isSidebarHiddenMobile = isSidebarCollapsed
  const isSidebarHidden = isMobile ? isSidebarHiddenMobile : isSidebarHiddenDesktop

  useEffect(() => {
    setIsSidebarCollapsed(true)
  }, [router.pathname, router.query.safe, isMobile, isSafeAppPage])

  return (
    <>
      <header className={css.header}>
        <Header onMenuToggle={collapseSidebar} />
      </header>

      <Sidebar
        isSidebarHidden={isSidebarHidden}
        showCollapseSidebarButton={showCollapseSidebarButton}
        collapseSidebar={collapseSidebar}
      />

      <div className={cn(css.main, isSidebarHidden && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
