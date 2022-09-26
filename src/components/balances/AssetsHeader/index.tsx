import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

const AssetsHeader = ({
  helperText,
  currencySelect = false,
}: {
  helperText?: string
  currencySelect?: boolean
}): ReactElement => {
  return (
    <PageHeader
      title="Assets"
      subtitle="See all your tokens and NFTs in one place"
      helperText={helperText}
      action={
        <Box display="flex" justifyContent="space-between">
          <NavTabs tabs={balancesNavItems} />
          {currencySelect && <CurrencySelect />}
        </Box>
      }
    />
  )
}

export default AssetsHeader
