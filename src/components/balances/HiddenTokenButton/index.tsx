import { type ReactElement } from 'react'
import { Typography, Button } from '@mui/material'
import { ASSETS_EVENTS } from '@/services/analytics'
import useHiddenTokens from '@/hooks/useHiddenTokens'
import useBalances from '@/hooks/useBalances'
import { VisibilityOutlined } from '@mui/icons-material'
import Track from '@/components/common/Track'

import css from './styles.module.css'
import { AbTest } from '@/services/tracking/abTesting'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'
import useABTesting from '@/services/tracking/useAbTesting'

const LS_ONBOARDING = 'ONBOARDING_HIDDEN_TOKEN_BUTTON'

const HiddenTokenButton = ({
  toggleShowHiddenAssets,
  showHiddenAssets,
}: {
  toggleShowHiddenAssets?: () => void
  showHiddenAssets?: boolean
}): ReactElement | null => {
  const { balances } = useBalances()
  const currentHiddenAssets = useHiddenTokens()
  const isTooltipShown = useABTesting(AbTest.HIDE_TOKEN_PROMO)

  const hiddenAssetCount =
    balances.items?.filter((item) => currentHiddenAssets.includes(item.tokenInfo.address)).length || 0

  return (
    <OnboardingTooltip
      className={css.hiddenTokenButton}
      initiallyShown={isTooltipShown}
      widgetLocalStorageId={LS_ONBOARDING}
      text="Spam or unwanted tokens in your asset list? Hide them now!"
    >
      <div>
        <Track {...ASSETS_EVENTS.SHOW_HIDDEN_ASSETS}>
          <Button
            className={css.hiddenTokenButton}
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
              <Typography fontSize="small">
                {hiddenAssetCount === 0
                  ? 'Hide tokens'
                  : `${hiddenAssetCount} hidden token${hiddenAssetCount > 1 ? 's' : ''}`}{' '}
              </Typography>
            </>
          </Button>
        </Track>
      </div>
    </OnboardingTooltip>
  )
}

export default HiddenTokenButton
