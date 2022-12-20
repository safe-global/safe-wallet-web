import { VisibilityOffOutlined } from '@mui/icons-material'
import { Box, Typography, Button } from '@mui/material'
import { useContext } from 'react'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'

import css from './styles.module.css'

const TokenMenu = () => {
  const { showHiddenAssets, isAssetSelected, visibleAssets, reset, saveChanges } = useContext(HiddenAssetsContext)

  const selectedAssetCount = visibleAssets?.filter((item) => isAssetSelected(item.tokenInfo.address)).length || 0

  if (selectedAssetCount === 0 && !showHiddenAssets) {
    return null
  }
  return (
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
  )
}

export default TokenMenu
