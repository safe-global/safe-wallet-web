import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { generalSettingsNavItems, settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'
import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const SettingsHeader = (): ReactElement => {
  const safeAddress = useSafeAddress()
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)

  const navItems = safeAddress ? settingsNavItems : generalSettingsNavItems
  const filteredNavItems = isNotificationFeatureEnabled
    ? navItems
    : navItems.filter((item) => item.href !== AppRoutes.settings.notifications)

  return (
    <PageHeader
      title={safeAddress ? 'Settings' : 'Preferences'}
      action={
        <div className={css.navWrapper}>
          <NavTabs tabs={filteredNavItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
