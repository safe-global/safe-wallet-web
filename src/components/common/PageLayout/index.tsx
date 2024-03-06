import classnames from 'classnames'
import { useContext, useEffect, useState, type ReactElement } from 'react'

import BatchSidebar from '@/components/batch/BatchSidebar'
import Header from '@/components/common/Header'
import { TxModalContext } from '@/components/tx-flow'
import { useIsSidebarRoute } from '@/hooks/useIsSidebarRoute'
import Footer from '../Footer'
import SafeLoadingError from '../SafeLoadingError'
import SideDrawer from './SideDrawer'
import css from './styles.module.css'

const PageLayout = ({ pathname, children }: { pathname: string; children: ReactElement }): ReactElement => {
  const [isSidebarRoute, isAnimated] = useIsSidebarRoute(pathname)
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isBatchOpen, setBatchOpen] = useState<boolean>(false)
  const { setFullWidth } = useContext(TxModalContext)

  useEffect(() => {
    setFullWidth(!isSidebarOpen)
  }, [isSidebarOpen, setFullWidth])

  return (
    <>
      <header className={css.header}>
        <Header onMenuToggle={isSidebarRoute ? setSidebarOpen : undefined} onBatchToggle={setBatchOpen} />
      </header>

      {isSidebarRoute && <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />}

      <div
        className={classnames(css.main, {
          [css.mainNoSidebar]: !isSidebarOpen || !isSidebarRoute,
          [css.mainAnimated]: isSidebarRoute && isAnimated,
        })}
      >
        <div data-sid="23699" className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <BatchSidebar isOpen={isBatchOpen} onToggle={setBatchOpen} />

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
