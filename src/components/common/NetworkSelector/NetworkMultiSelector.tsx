import useChains from '@/hooks/useChains'
import { type ReactElement, useState } from 'react'
import { Checkbox, Autocomplete, TextField, Chip } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import { useRouter } from 'next/router'
import useWallet from '@/hooks/wallets/useWallet'
import { getNetworkLink } from '.'

const NetworkMultiSelector = ({
  selectedNetworks,
  setSelectedNetworks,
}: {
  selectedNetworks: ChainInfo[]
  setSelectedNetworks: (selectedChains: ChainInfo[]) => void
}): ReactElement => {
  const { configs } = useChains()
  const errorText = !selectedNetworks.length && 'Select at least one network'
  const isWalletConnected = !!useWallet()

  const router = useRouter()

  const [inputValue, setInputValue] = useState('')

  const handleChange = (newValue: ChainInfo[]) => {
    if (newValue.length === 1) {
      const shortName = newValue[0].shortName
      const networkLink = getNetworkLink(router.pathname, router.query, shortName, isWalletConnected)
      router.push(networkLink)
    }
    setSelectedNetworks(newValue)
  }

  const handleDelete = (optionToDelete: ChainInfo) => {
    const updatedNetworks = selectedNetworks.filter((option) => option.chainId !== optionToDelete.chainId)
    handleChange(updatedNetworks)
  }

  return (
    <Autocomplete
      multiple
      value={selectedNetworks}
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
