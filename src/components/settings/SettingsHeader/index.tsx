import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import css from '@/components/common/PageHeader/styles.module.css'
import { generalSettingsNavItems, settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import useSafeAddress from '@/hooks/useSafeAddress'

const SettingsHeader = (): ReactElement => {
  const safeAddress = useSafeAddress()

  const navItems = safeAddress ? settingsNavItems : generalSettingsNavItems

  return (
    <PageHeader
      title={safeAddress ? 'Settings' : 'Preferences'}
      action={
        <div data-sid="44096" className={css.navWrapper}>
          <NavTabs tabs={navItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
