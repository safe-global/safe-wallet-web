import { Sticky } from '@/components/common/Sticky'
import Track from '@/components/common/Track'
import { ASSETS_EVENTS } from '@/services/analytics'
import { VisibilityOffOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'

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
    <Sticky>
      <Box data-sid="49328" className={css.wrapper}>
        <Box data-sid="14430" className={css.hideTokensHeader}>
          <VisibilityOffOutlined />
          <Typography variant="body2" lineHeight="inherit">
            {selectedAssetCount} {selectedAssetCount === 1 ? 'token' : 'tokens'} selected
          </Typography>
        </Box>
        <Box data-sid="51300" display="flex" flexDirection="row" gap={1}>
          <Track {...ASSETS_EVENTS.CANCEL_HIDE_DIALOG}>
            <Button data-sid="24124" onClick={cancel} className={css.cancelButton} size="small" variant="outlined">
              Cancel
            </Button>
          </Track>
          <Track {...ASSETS_EVENTS.DESELECT_ALL_HIDE_DIALOG}>
            <Button data-sid="43886" onClick={deselectAll} className={css.cancelButton} size="small" variant="outlined">
              Deselect all
            </Button>
          </Track>
          <Track {...ASSETS_EVENTS.SAVE_HIDE_DIALOG}>
            <Button data-sid="82157" onClick={saveChanges} className={css.applyButton} size="small" variant="contained">
              Save
            </Button>
          </Track>
        </Box>
      </Box>
    </Sticky>
  )
}

export default TokenMenu
