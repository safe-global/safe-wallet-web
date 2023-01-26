import { useCurrentChain } from '@/hooks/useChains'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setTokenList, TOKEN_LISTS } from '@/store/settingsSlice'
import { FEATURES, hasFeature } from '@/utils/chains'
import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const TokenListSelect = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()
  const hasDefaultTokenlist = chain && hasFeature(chain, FEATURES.DEFAULT_TOKENLIST)

  const handleSelectTokenList = (event: SelectChangeEvent<TOKEN_LISTS>) => {
    const selectedString = event.target.value as TOKEN_LISTS
    dispatch(setTokenList(selectedString))
  }

  if (!hasDefaultTokenlist) {
    return null
  }

  return (
    <FormControl size="small">
      <InputLabel id="tokenlist-select-label">Tokenlist</InputLabel>
      <Select
        labelId="tokenlist-select-label"
        id="tokenlist-select"
        value={settings.tokenList}
        label="Tokenlist"
        onChange={handleSelectTokenList}
      >
        <MenuItem value={TOKEN_LISTS.DEFAULT}>Default tokens</MenuItem>
        <MenuItem value={TOKEN_LISTS.ALL}>All tokens</MenuItem>
      </Select>
    </FormControl>
  )
}

export default TokenListSelect
