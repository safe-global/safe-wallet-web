import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { generalSettingsNavItems, settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'

const SettingsHeader = (): ReactElement => {
  const safeAddress = useSafeAddress()

  return (
    <PageHeader
      title={safeAddress ? 'Settings' : 'Preferences'}
      action={
        <div className={css.navWrapper}>
          <NavTabs tabs={safeAddress ? settingsNavItems : generalSettingsNavItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
