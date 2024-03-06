import ExternalLink from '@/components/common/ExternalLink'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'
import Track from '@/components/common/Track'
import { HelpCenterArticle } from '@/config/constants'
import { useHasFeature } from '@/hooks/useChains'
import InfoIcon from '@/public/images/notifications/info.svg'
import { ASSETS_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch, useAppSelector } from '@/store'
import { TOKEN_LISTS, selectSettings, setTokenList } from '@/store/settingsSlice'
import { FEATURES } from '@/utils/chains'
import type { SelectChangeEvent } from '@mui/material'
import { Box, FormControl, InputLabel, MenuItem, Select, SvgIcon, Tooltip, Typography } from '@mui/material'

const LS_TOKENLIST_ONBOARDING = 'tokenlist_onboarding'

const TokenListLabel = {
  [TOKEN_LISTS.TRUSTED]: 'Default tokens',
  [TOKEN_LISTS.ALL]: 'All tokens',
}

const TokenListSelect = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const hasDefaultTokenlist = useHasFeature(FEATURES.DEFAULT_TOKENLIST)

  const handleSelectTokenList = (event: SelectChangeEvent<TOKEN_LISTS>) => {
    const selectedString = event.target.value as TOKEN_LISTS
    dispatch(setTokenList(selectedString))
  }

  if (!hasDefaultTokenlist) {
    return null
  }

  return (
    <FormControl size="small">
      <InputLabel id="tokenlist-select-label">Token list</InputLabel>

      <OnboardingTooltip
        widgetLocalStorageId={LS_TOKENLIST_ONBOARDING}
        text={
          <>
            Spam filter on!
            <br />
            Switch to &quot;All tokens&quot; to see all of your tokens.
          </>
        }
      >
        <Select
          labelId="tokenlist-select-label"
          id="tokenlist-select"
          value={settings.tokenList}
          label="Tokenlist"
          onChange={handleSelectTokenList}
          renderValue={(value) => TokenListLabel[value]}
          onOpen={() => trackEvent(ASSETS_EVENTS.OPEN_TOKEN_LIST_MENU)}
          sx={{ minWidth: '152px' }}
        >
          <MenuItem value={TOKEN_LISTS.TRUSTED}>
            <Track {...ASSETS_EVENTS.SHOW_DEFAULT_TOKENS}>
              <Box data-sid="16997" display="flex" flexDirection="row" gap="4px" alignItems="center" minWidth={155}>
                {TokenListLabel.TRUSTED}
                <Tooltip
                  arrow
                  title={
                    <Typography>
                      Learn more about <ExternalLink href={HelpCenterArticle.SPAM_TOKENS}>default tokens</ExternalLink>
                    </Typography>
                  }
                >
                  <span>
                    <SvgIcon sx={{ display: 'block' }} color="border" fontSize="small" component={InfoIcon} />
                  </span>
                </Tooltip>
              </Box>
            </Track>
          </MenuItem>

          <MenuItem value={TOKEN_LISTS.ALL}>
            <Track {...ASSETS_EVENTS.SHOW_ALL_TOKENS}>
              <span>{TokenListLabel.ALL}</span>
            </Track>
          </MenuItem>
        </Select>
      </OnboardingTooltip>
    </FormControl>
  )
}

export default TokenListSelect
