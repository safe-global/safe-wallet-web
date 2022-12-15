import { Box, ButtonBase, Typography } from '@mui/material'
import { type ReactElement, useContext } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import useHiddenAssets from '@/hooks/useHiddenAssets'
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'

import css from './styles.module.css'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'

const AssetsHeader = ({
  hiddenAssets = false,
  currencySelect = false,
}: {
  hiddenAssets?: boolean
  currencySelect?: boolean
}): ReactElement => {
  const currentHiddenAssets = useHiddenAssets()
  const hiddenAssetCount = currentHiddenAssets ? Object.keys(currentHiddenAssets).length : 0
  const { showHiddenAssets, toggleShowHiddenAssets } = useContext(HiddenAssetsContext)

  return (
    <PageHeader
      title="Assets"
      action={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <NavTabs tabs={balancesNavItems} />
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            {hiddenAssets && hiddenAssetCount > 0 && (
              <ButtonBase className={css.hiddenAssetsButton} onClick={toggleShowHiddenAssets}>
                {showHiddenAssets ? (
                  <VisibilityOutlined color="border" fontSize="small" />
                ) : (
                  <VisibilityOffOutlined color="border" fontSize="small" />
                )}{' '}
                <Typography fontSize="small">{hiddenAssetCount}</Typography>
              </ButtonBase>
            )}
            {currencySelect && <CurrencySelect />}
          </Box>
        </Box>
      }
    />
  )
}

export default AssetsHeader
