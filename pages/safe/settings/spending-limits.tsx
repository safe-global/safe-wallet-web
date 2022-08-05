import SpendingLimits from '@/components/settings/SpendingLimits'

import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PaddedMain } from '@/components/common/PaddedMain'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const SpendingLimitsPage: NextPage = () => {
  return (
    <PaddedMain>
      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Spending Limits" />
      <SpendingLimits />
    </PaddedMain>
  )
}

export default SpendingLimitsPage
