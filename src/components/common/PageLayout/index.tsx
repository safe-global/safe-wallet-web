import { useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer from './SideDrawer'
import PsaBanner from '../PsaBanner'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const hideSidebar = [
    AppRoutes.share.safeApp,
    AppRoutes.newSafe.create,
    AppRoutes.newSafe.load,
    AppRoutes.welcome,
    AppRoutes.index,
  ].includes(router.pathname)

  return (
    <>
      <header className={css.header}>
        <PsaBanner />
        <Header onMenuToggle={toggleSidebar} />
      </header>

      {!hideSidebar && <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />}

      <div className={classnames(css.main, (!isSidebarOpen || hideSidebar) && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
