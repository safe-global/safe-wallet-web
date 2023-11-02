import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { generalSettingsNavItems, settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'
import useSafeAddress from '@/hooks/useSafeAddress'
import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

type NavItem = {
  href: string
  label: string
}

type HideConditions = Record<string, boolean>

const filterRoutes = (navItems: NavItem[], hideConditions: HideConditions) => {
  return navItems.filter((item) => !Boolean(hideConditions[item.href]))
}

const SettingsHeader = (): ReactElement => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)
  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  const navItems = safeAddress ? settingsNavItems : generalSettingsNavItems

  const filteredItems = useMemo(() => {
    return filterRoutes(navItems, {
      [AppRoutes.settings.notifications]: !isNotificationFeatureEnabled,
      [AppRoutes.settings.securityLogin]: !isSocialLogin,
    })
  }, [isNotificationFeatureEnabled, isSocialLogin, navItems])

  return (
    <PageHeader
      title={safeAddress ? 'Settings' : 'Preferences'}
      action={
        <div className={css.navWrapper}>
          <NavTabs tabs={filteredItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
