import { useContext, useEffect, useState, type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common/Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import Footer from '../Footer'
import SideDrawer from './SideDrawer'
import { AppRoutes } from '@/config/routes'
import useDebounce from '@/hooks/useDebounce'
import { useRouter } from 'next/router'
import { TxModalContext } from '@/components/tx-flow'
import BatchSidebar from '@/components/batch/BatchSidebar'

const isNoSidebarRoute = (pathname: string): boolean => {
  return [
    AppRoutes.share.safeApp,
    AppRoutes.newSafe.create,
    AppRoutes.newSafe.load,
    AppRoutes.welcome,
    AppRoutes.index,
    AppRoutes.imprint,
    AppRoutes.privacy,
    AppRoutes.cookie,
    AppRoutes.terms,
    AppRoutes.licenses,
  ].includes(pathname)
}

const PageLayout = ({ pathname, children }: { pathname: string; children: ReactElement }): ReactElement => {
  const router = useRouter()
  const [noSidebar, setNoSidebar] = useState<boolean>(isNoSidebarRoute(pathname))
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const [isBatchOpen, setBatchOpen] = useState<boolean>(false)
  const hideSidebar = noSidebar || !isSidebarOpen
  const { setFullWidth } = useContext(TxModalContext)
  let isAnimated = useDebounce(!noSidebar, 300)
  if (noSidebar) isAnimated = false

  useEffect(() => {
    const noSafeAddress = router.isReady && !router.query.safe
    setNoSidebar(isNoSidebarRoute(pathname) || noSafeAddress)
  }, [pathname, router])

  useEffect(() => {
    setFullWidth(hideSidebar)
  }, [hideSidebar, setFullWidth])

  return (
    <>
      <header className={css.header}>
        <Header onMenuToggle={noSidebar ? undefined : setSidebarOpen} onBatchToggle={setBatchOpen} />
      </header>

      {!noSidebar && <SideDrawer isOpen={isSidebarOpen} onToggle={setSidebarOpen} />}

      <div
        className={classnames(css.main, {
          [css.mainNoSidebar]: hideSidebar,
          [css.mainAnimated]: isAnimated,
        })}
      >
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        <BatchSidebar isOpen={isBatchOpen} onToggle={setBatchOpen} />

        <Footer />
      </div>
    </>
  )
}

export default PageLayout
