import { type ReactElement } from 'react'
import { Typography, ToggleButton } from '@mui/material'
import { ASSETS_EVENTS } from '@/services/analytics'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import useBalances from '@/hooks/useBalances'
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material'
import Track from '@/components/common/Track'

const HiddenTokenToggle = ({
  toggleShowHiddenAssets,
  showHiddenAssets,
}: {
  toggleShowHiddenAssets?: () => void
  showHiddenAssets?: boolean
}): ReactElement | null => {
  const { balances } = useBalances(true)
  const currentHiddenAssets = useHiddenTokens()

  const hiddenAssetCount =
    balances.items?.filter((item) => currentHiddenAssets.includes(item.tokenInfo.address)).length || 0

  if (hiddenAssetCount === 0) {
    return null
  }

  return (
    <Track {...ASSETS_EVENTS.TOGGLE_HIDDEN_ASSETS}>
      <ToggleButton
        sx={{ gap: 1, padding: 1 }}
        value="showHiddenAssets"
        onClick={toggleShowHiddenAssets}
        selected={showHiddenAssets}
        data-testid="toggle-hidden-assets"
      >
        {showHiddenAssets ? (
          <>
            <VisibilityOffOutlined fontSize="small" />{' '}
            <Typography fontSize="small">Hide {hiddenAssetCount} hidden</Typography>
          </>
        ) : (
          <>
            <VisibilityOutlined fontSize="small" />
            <Typography fontSize="small">Show {hiddenAssetCount} hidden</Typography>
          </>
        )}
      </ToggleButton>
    </Track>
  )
}

export default HiddenTokenToggle
