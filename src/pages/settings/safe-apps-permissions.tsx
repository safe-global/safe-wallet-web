import type { NextPage } from 'next'
import Head from 'next/head'

import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SafeAppsPermissions from '@/components/settings/SafeAppsPermissions'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const SafeAppsPermissionsPage: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Settings – Safe Apps Permissions</title>
      </Head>

      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Safe Apps Permissions" />

      <SafeAppsPermissions />
    </main>
  )
}

export default SafeAppsPermissionsPage
