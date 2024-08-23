import useChains from '@/hooks/useChains'
import { type ReactElement, useState } from 'react'
import { Checkbox, Autocomplete, TextField, Chip } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import { useFormContext } from 'react-hook-form'

const NetworkMultiSelector = ({
  name,
  error,
  onChainsUpdate,
}: {
  name: string
  onChainsUpdate: (selectedChains: ChainInfo[]) => void
  error?: string
}): ReactElement => {
  const { configs } = useChains()
  const { register, formState } = useFormContext() || {}

  const [selectedOptions, setSelectedOptions] = useState<ChainInfo[]>([])
  const errorText = !selectedOptions.length && 'Select at least one network'

  const [inputValue, setInputValue] = useState('')

  const handleChange = (newValue: ChainInfo[]) => {
    onChainsUpdate(newValue)
    setSelectedOptions(newValue)
  }

  const handleDelete = (optionToDelete: ChainInfo) => {
    const updatedNetworks = selectedOptions.filter((option) => option.chainId !== optionToDelete.chainId)
    handleChange(updatedNetworks)
  }

  return (
    <Autocomplete
      multiple
      value={selectedOptions}
      onChange={(_, newValue: ChainInfo[]) => handleChange(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      options={configs}
      getOptionLabel={(option) => option.chainName}
      disableCloseOnSelect
      renderTags={(selectedOptions, getTagProps) =>
        selectedOptions.map((network) => (
          <Chip
            variant="outlined"
            key={network.chainId}
            label={<ChainIndicator chainId={network.chainId} inline />}
            onDelete={() => handleDelete(network)}
            sx={{ py: 2, mr: 0.5, mb: 0.5 }}
          ></Chip>
        ))
      }
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox size="small" checked={selected} />
          <ChainIndicator chainId={option.chainId} inline />
        </li>
      )}
      renderInput={(params) => <TextField {...params} error={!!errorText} helperText={errorText} />}
      sx={{ width: '100%', '&.MuiInputBase-root': { pr: 1 } }}
    />
  )
}

export default NetworkMultiSelector
