import type { ReactElement, ReactNode } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

import css from '@/components/common/PageHeader/styles.module.css'

const AssetsHeader = ({ children }: { children?: ReactNode }): ReactElement => {
  return (
    <PageHeader
      title="Assets"
      action={
        <div className={css.pageHeader}>
          <div className={css.navWrapper}>
            <NavTabs tabs={balancesNavItems} />
          </div>
          {children && <div className={css.actionsWrapper}>{children}</div>}
        </div>
      }
    />
  )
}

export default AssetsHeader
