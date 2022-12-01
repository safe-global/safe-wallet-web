import { useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer from './SideDrawer'

const PageLayout = ({ children }: { children: ReactElement }): ReactElement => {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  return (
    <div className={css.wrapper}>
      <header className={css.header}>
        <Header onMenuToggle={toggleSidebar} />
      </header>

      <div className={css.container}>
        <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />

        <div className={classnames(css.main, !isSidebarOpen && css.mainNoSidebar)}>
          <div className={css.content}>
            <SafeLoadingError>{children}</SafeLoadingError>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  )
}

export default PageLayout
