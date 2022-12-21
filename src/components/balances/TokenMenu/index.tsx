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
    <Box className={css.stickyBox}>
      <Box className={css.hideTokensHeader}>
        <VisibilityOffOutlined />
        <Typography>
          {selectedAssetCount} {selectedAssetCount === 1 ? 'token' : 'tokens'} selected
        </Typography>
      </Box>
      <div>
        <Button onClick={reset} className={css.cancelButton} size="small" variant="outlined">
          Cancel
        </Button>
        <Button onClick={saveChanges} className={css.applyButton} size="small" variant="contained">
          Apply
        </Button>
      </div>
    </Box>
  )
}

export default TokenMenu
