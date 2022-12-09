import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

const AssetsHeader = ({ currencySelect = false }: { currencySelect?: boolean }): ReactElement => {
  return (
    <PageHeader
      title="Assets"
      action={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <NavTabs tabs={balancesNavItems} />
          {currencySelect && <CurrencySelect />}
        </Box>
      }
    />
  )
}

export default AssetsHeader
