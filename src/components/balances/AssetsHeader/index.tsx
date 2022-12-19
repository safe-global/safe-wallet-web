import { Box, Button, Typography } from '@mui/material'
import { type ReactElement, useContext } from 'react'

import NavTabs from '@/components/common/NavTabs'
import PageHeader from '@/components/common/PageHeader'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { balancesNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { VisibilityOffOutlined } from '@mui/icons-material'

import css from './styles.module.css'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'
import TokenListSelect from '../TokenListSelect'

const AssetsHeader = ({
  hiddenAssets = false,
  currencySelect = false,
}: {
  hiddenAssets?: boolean
  currencySelect?: boolean
}): ReactElement => {
  const { showHiddenAssets, isAssetSelected, visibleAssets, assetsToHide, reset, saveChanges } =
    useContext(HiddenAssetsContext)

  const selectedAssetCount = visibleAssets?.filter((item) => isAssetSelected(item.tokenInfo.address)).length || 0

  return (
    <PageHeader
      title="Assets"
      action={
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <NavTabs tabs={balancesNavItems} />
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              {hiddenAssets && <TokenListSelect />}
              {currencySelect && <CurrencySelect />}
            </Box>
          </Box>
          {/* TODO: refactor into own component */}
          {(assetsToHide.length > 0 || showHiddenAssets) && (
            <Box
              position="sticky"
              top="20px"
              display="flex"
              flexWrap="wrap"
              flexDirection="row"
              alignItems="center"
              gap={1}
              mb={1}
              mt={2}
            >
              <Box className={css.hideTokensHeader}>
                <VisibilityOffOutlined />
                <Typography>
                  {selectedAssetCount} {selectedAssetCount === 1 ? 'token' : 'tokens'} selected
                </Typography>
              </Box>
              <div>
                <Button onClick={reset} className={css.tinyButton} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={saveChanges} className={css.tinyButton} variant="contained">
                  Apply
                </Button>
              </div>
            </Box>
          )}
        </>
      }
    />
  )
}

export default AssetsHeader
