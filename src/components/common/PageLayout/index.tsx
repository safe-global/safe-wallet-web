import { type ReactElement } from 'react'
import classnames from 'classnames'

import Header from '@/components/common//Header'
import css from './styles.module.css'
import SafeLoadingError from '../SafeLoadingError'
import { AppRoutes } from '@/config/routes'
import useDebounce from '@/hooks/useDebounce'

const isNoSidebarRoute = (pathname: string): boolean => {
  return [
    AppRoutes.share.safeApp,
    AppRoutes.newSafe.create,
    AppRoutes.newSafe.load,
    AppRoutes.welcome,
    AppRoutes.index,
  ].includes(pathname)
}

const PageLayout = ({ pathname, children }: { pathname: string; children: ReactElement }): ReactElement => {
  const noSidebar = isNoSidebarRoute(pathname)
  let isAnimated = useDebounce(!noSidebar, 300)
  if (noSidebar) isAnimated = false

  return (
    <>
      <header className={css.header}>
        <Header />
      </header>

      <div className={classnames(css.main, css.mainNoSidebar)}>
        <div className={css.content}>
          <SafeLoadingError>{children}</SafeLoadingError>
        </div>

        {/* <Footer /> */}
      </div>
    </>
  )
}

export default PageLayout
