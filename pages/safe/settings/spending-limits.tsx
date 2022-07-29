import SpendingLimits from '@/components/settings/SpendingLimits'

import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const SpendingLimitsPage: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Spending Limits" />
      <SpendingLimits />
    </main>
  )
}

export default SpendingLimitsPage
