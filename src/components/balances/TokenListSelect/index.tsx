import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setTokenList } from '@/store/settingsSlice'
import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const TokenListSelect = () => {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)

  const handleSelectTokenList = (event: SelectChangeEvent<'DEFAULT' | 'ALL'>) => {
    const selectedString = event.target.value as 'DEFAULT' | 'ALL'
    dispatch(setTokenList(selectedString))
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
        <MenuItem value="DEFAULT">Default tokens</MenuItem>
        <MenuItem value="ALL">All tokens</MenuItem>
      </Select>
    </FormControl>
  )
}

export default TokenListSelect
