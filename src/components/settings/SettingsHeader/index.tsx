import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'

const SettingsHeader = (): ReactElement => {
  return (
    <PageHeader
      title="Settings"
      action={<NavTabs tabs={settingsNavItems} />}
      sx={{ borderBottom: ({ palette }) => `1px solid ${palette.border.light}` }}
    />
  )
}

export default SettingsHeader
