import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { generalSettingsNavItems, settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useCurrentChain } from '@/hooks/useChains'
import { isRouteEnabled } from '@/utils/chains'

const SettingsHeader = (): ReactElement => {
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()

  const navItems = safeAddress
    ? settingsNavItems.filter((route) => isRouteEnabled(route.href, chain))
    : generalSettingsNavItems

  return (
    <PageHeader
      title={safeAddress ? 'Settings' : 'Preferences'}
      action={
        <div className={css.navWrapper}>
          <NavTabs tabs={navItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
