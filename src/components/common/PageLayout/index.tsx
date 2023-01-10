import { useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer, { isNoSidebarRoute } from './SideDrawer'
import PsaBanner from '../PsaBanner'

const PageLayout = ({ pathname, children }: { pathname: string; children: ReactElement }): ReactElement => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(!isNoSidebarRoute(pathname))

  return (
    <>
      <header className={css.header}>
        <PsaBanner />
        <Header onMenuToggle={setSidebarOpen} />
      </header>

      <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />

      <div className={classnames(css.main, !isSidebarOpen && css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
