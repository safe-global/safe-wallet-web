import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'

const SettingsHeader = (): ReactElement => {
  return (
    <PageHeader
      title="Settings"
      action={
        <div className={css.navWrapper}>
          <NavTabs tabs={settingsNavItems} />
        </div>
      }
    />
  )
}

export default SettingsHeader
