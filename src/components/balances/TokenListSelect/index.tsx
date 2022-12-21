import { type ReactElement, useContext } from 'react'
import { Typography, ToggleButton, Tooltip } from '@mui/material'
import { ASSETS_EVENTS } from '@/services/analytics'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'
import useHiddenAssets from '@/hooks/useHiddenAssets'
import useBalances from '@/hooks/useBalances'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import Track from '@/components/common/Track'

const TOGGLE_HIDDEN_ASSETS = 'toggleHiddenAssets'

const OPTION_ALL_TOKENS = 'All tokens'

const TokenListSelect = (): ReactElement | null => {
  const { toggleShowHiddenAssets, showHiddenAssets } = useContext(HiddenAssetsContext)

  const { balances } = useBalances(true)
  const currentHiddenAssets = useHiddenAssets()

  const hiddenAssetCount =
    balances.items?.filter((item) => currentHiddenAssets?.[item.tokenInfo.address] !== undefined).length || 0

  if (hiddenAssetCount === 0) {
    return null
  }

  return (
    <Track {...ASSETS_EVENTS.TOGGLE_HIDDEN_ASSETS}>
      <Tooltip title="Toggle hidden assets" arrow>
        <ToggleButton
          sx={{ gap: 1, padding: 1 }}
          value="showHiddenAssets"
          onClick={toggleShowHiddenAssets}
          selected={showHiddenAssets}
          data-testid="toggle-hidden-assets"
        >
          <>
            {showHiddenAssets ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
            <Typography fontSize="small">{hiddenAssetCount}</Typography>
          </>
        </ToggleButton>
      </Tooltip>
    </Track>
  )
}

export default TokenListSelect
