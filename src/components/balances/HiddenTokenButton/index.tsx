import Track from '@/components/common/Track'
import useBalances from '@/hooks/useBalances'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import { ASSETS_EVENTS } from '@/services/analytics'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import { Button, Typography } from '@mui/material'
import { type ReactElement } from 'react'

import css from './styles.module.css'

const HiddenTokenButton = ({
  toggleShowHiddenAssets,
  showHiddenAssets,
}: {
  toggleShowHiddenAssets?: () => void
  showHiddenAssets?: boolean
}): ReactElement | null => {
  const { balances } = useBalances()
  const currentHiddenAssets = useHiddenTokens()

  const hiddenAssetCount =
    balances.items?.filter((item) => currentHiddenAssets.includes(item.tokenInfo.address)).length || 0

  return (
    <div data-sid="42394" className={css.hiddenTokenButton}>
      <Track {...ASSETS_EVENTS.SHOW_HIDDEN_ASSETS}>
        <Button
          data-sid="46237"
          sx={{
            gap: 1,
            padding: 1,
            borderWidth: '1px !important',
            borderColor: ({ palette }) => palette.border.main,
          }}
          disabled={showHiddenAssets}
          onClick={toggleShowHiddenAssets}
          data-testid="toggle-hidden-assets"
          variant="outlined"
        >
          <>
            <VisibilityOutlined fontSize="small" />
            <Typography fontSize="medium">
              {hiddenAssetCount === 0
                ? 'Hide tokens'
                : `${hiddenAssetCount} hidden token${hiddenAssetCount > 1 ? 's' : ''}`}{' '}
            </Typography>
          </>
        </Button>
      </Track>
    </div>
  )
}

export default HiddenTokenButton
