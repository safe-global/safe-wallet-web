import { Box } from '@mui/material'
import { type ReactElement } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'

import HiddenTokenToggle from '../HiddenTokenToggle'

const AssetsHeader = ({
  hiddenAssets = false,
  currencySelect = false,
  toggleShowHiddenAssets,
  showHiddenAssets = false,
}: {
  hiddenAssets?: boolean
  currencySelect?: boolean
  toggleShowHiddenAssets?: () => void
  showHiddenAssets?: boolean
}): ReactElement => {
  return (
    <PageHeader
      title="Assets"
      action={
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <NavTabs tabs={balancesNavItems} />
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              {hiddenAssets && (
                <HiddenTokenToggle
                  showHiddenAssets={showHiddenAssets}
                  toggleShowHiddenAssets={toggleShowHiddenAssets}
                />
              )}
              {currencySelect && <CurrencySelect />}
            </Box>
          </Box>
        </>
      }
    />
  )
}

export default AssetsHeader
