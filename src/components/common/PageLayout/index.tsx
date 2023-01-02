import { useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer from './SideDrawer'
import PsaBanner from '../PsaBanner'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const showFooter = router.pathname.startsWith(AppRoutes.settings.index)

  return (
    <>
      <header className={css.header}>
        <PsaBanner />
        <Header onMenuToggle={toggleSidebar} />
      </header>

      <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />

      <div className={classnames(css.main, !isSidebarOpen && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        {showFooter && <Footer />}
      </div>
    </>
  )
}

export default PageLayout
