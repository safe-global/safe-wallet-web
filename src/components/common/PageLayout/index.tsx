import { useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer from './SideDrawer'
import PsaBanner from '../PsaBanner'
import { isAppShareRoute, isIndexRoute, isLoadSafeRoute, isNewSafeRoute, isWelcomeRoute } from '@/utils/route'
import { useRouter } from 'next/router'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const showSidebar =
    !isAppShareRoute(router.pathname) &&
    !isNewSafeRoute(router.pathname) &&
    !isLoadSafeRoute(router.pathname) &&
    !isWelcomeRoute(router.pathname) &&
    !isIndexRoute(router.pathname)

  return (
    <>
      <header className={css.header}>
        <PsaBanner />
        <Header onMenuToggle={toggleSidebar} />
      </header>

      {showSidebar && <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />}

      <div className={classnames(css.main, (!isSidebarOpen || !showSidebar) && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
