import type { ReactElement } from 'react'
import { Box } from '@mui/material'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import { settingsNavItems } from '@/components/sidebar/SidebarNavigation/config'
import css from '@/components/common/PageHeader/styles.module.css'

const SettingsHeader = (): ReactElement => {
  return (
    <PageHeader
      title="Settings"
      action={
        <Box className={css.navWrapper}>
          <NavTabs tabs={settingsNavItems} />
        </Box>
      }
    />
  )
}

export default SettingsHeader
