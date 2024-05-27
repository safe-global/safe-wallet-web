import type { ReactElement, ReactNode } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

import css from '@/components/common/PageHeader/styles.module.css'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const AssetsHeader = ({ children }: { children?: ReactNode }): ReactElement => {
  const isNftsEnabled = useHasFeature(FEATURES.ERC721)
  const navItems = isNftsEnabled ? balancesNavItems : [balancesNavItems[0]]

  return (
    <PageHeader
      title="Assets"
      action={
        <div className={css.pageHeader}>
          <div className={css.navWrapper}>
            <NavTabs tabs={navItems} />
          </div>
          {children && <div className={css.actionsWrapper}>{children}</div>}
        </div>
      }
    />
  )
}

export default AssetsHeader
