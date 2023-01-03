import { VisibilityOffOutlined } from '@mui/icons-material'
import { Box, Typography, Button } from '@mui/material'

import css from './styles.module.css'

const TokenMenu = ({
  saveChanges,
  cancel,
  selectedAssetCount,
  showHiddenAssets,
  deselectAll,
}: {
  saveChanges: () => void
  cancel: () => void
  deselectAll: () => void
  selectedAssetCount: number
  showHiddenAssets: boolean
}) => {
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
        <Button onClick={cancel} className={css.cancelButton} size="small" variant="outlined">
          Cancel
        </Button>
        <Button onClick={deselectAll} className={css.cancelButton} size="small" variant="outlined">
          Deselect all
        </Button>
        <Button onClick={saveChanges} className={css.applyButton} size="small" variant="contained">
          Save
        </Button>
      </div>
    </Box>
  )
}

export default TokenMenu
