import { type ReactElement, useContext } from 'react'
import { Divider, type SelectChangeEvent, Typography, Radio } from '@mui/material'
import { FormControl, MenuItem, Select } from '@mui/material'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'
import { HiddenAssetsContext } from '../HiddenAssetsProvider'
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import useHiddenAssets from '@/hooks/useHiddenAssets'
import useBalances from '@/hooks/useBalances'

const TOGGLE_HIDDEN_ASSETS = 'toggleHiddenAssets'

const OPTION_ALL_TOKENS = 'All tokens'

const TokenListSelect = (): ReactElement => {
  const { toggleShowHiddenAssets, showHiddenAssets } = useContext(HiddenAssetsContext)

  const { balances } = useBalances(true)
  const currentHiddenAssets = useHiddenAssets()

  const hiddenAssetCount =
    balances.items?.filter((item) => currentHiddenAssets?.[item.tokenInfo.address] !== undefined).length || 0

  const handleChange = (e: SelectChangeEvent<string>) => {
    const option = e.target.value

    trackEvent({
      ...ASSETS_EVENTS.CHANGE_TOKEN_LIST,
      label: option.toUpperCase(),
    })

    if (option === TOGGLE_HIDDEN_ASSETS) {
      toggleShowHiddenAssets()
    }
  }

  const handleTrack = (label: 'Open' | 'Close') => {
    trackEvent({
      ...ASSETS_EVENTS.TOKEN_LIST_MENU,
      label,
    })
  }

  return (
    <FormControl size="small">
      <Select
        autoWidth
        id="tokenlist"
        value={OPTION_ALL_TOKENS}
        onChange={handleChange}
        onOpen={() => handleTrack('Open')}
        onClose={() => handleTrack('Close')}
        renderValue={(value) => <Typography>{value}</Typography>}
      >
        <MenuItem value={OPTION_ALL_TOKENS} sx={{ gap: '8px', overflow: 'hidden' }}>
          <Radio sx={{ padding: 0 }} checked size="small" disableRipple />
          <Typography variant="body2">All tokens</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={hiddenAssetCount === 0}
          value={TOGGLE_HIDDEN_ASSETS}
          sx={{ gap: '8px', overflow: 'hidden' }}
        >
          {showHiddenAssets ? (
            <VisibilityOutlined color="border" fontSize="small" />
          ) : (
            <VisibilityOffOutlined color="border" fontSize="small" />
          )}{' '}
          <Typography variant="body2">
            {showHiddenAssets ? 'Hide' : 'Show'} {hiddenAssetCount} hidden token(s)
          </Typography>
        </MenuItem>
      </Select>
    </FormControl>
  )
}

export default TokenListSelect
