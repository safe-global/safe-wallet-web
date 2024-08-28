import useChains from '@/hooks/useChains'
import { type ReactElement } from 'react'
import { Checkbox, Autocomplete, TextField, Chip } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { Controller, useFormContext } from 'react-hook-form'
import { useRouter } from 'next/router'
import { getNetworkLink } from '.'
import useWallet from '@/hooks/wallets/useWallet'

const NetworkMultiSelector = ({ name }: { name: string }): ReactElement => {
  const { configs } = useChains()
  const router = useRouter()
  const isWalletConnected = !!useWallet()

  const {
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useFormContext()

  const handleDelete = (deletedChainId: string) => {
    const currentValues: ChainInfo[] = getValues(name) || []
    const updatedValues = currentValues.filter((chain) => chain.chainId !== deletedChainId)
    updateSelectedNetwork(updatedValues)
    setValue(name, updatedValues)
  }

  const updateSelectedNetwork = (chains: ChainInfo[]) => {
    if (chains.length !== 1) return
    const shortName = chains[0].shortName
    const networkLink = getNetworkLink(router.pathname, router.query, shortName, isWalletConnected)
    router.push(networkLink)
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Autocomplete
            {...field}
            multiple
            value={field.value || []}
            disableCloseOnSelect
            options={configs}
            renderTags={(selectedOptions, getTagProps) =>
              selectedOptions.map((chain) => (
                <Chip
                  variant="outlined"
                  key={chain.chainId}
                  avatar={<ChainIndicator chainId={chain.chainId} onlyLogo inline />}
                  label={chain.chainName}
                  onDelete={() => handleDelete(chain.chainId)}
                  className={css.multiChainChip}
                ></Chip>
              ))
            }
            renderOption={(props, chain, { selected }) => (
              <li {...props}>
                <Checkbox size="small" checked={selected} />
                <ChainIndicator chainId={chain.chainId} inline />
              </li>
            )}
            getOptionLabel={(option) => option.chainName}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!errors.networks}
                helperText={errors.networks ? 'Select at least one network' : ''}
              />
            )}
            filterOptions={(options, { inputValue }) =>
              options.filter((option) => option.chainName.toLowerCase().includes(inputValue.toLowerCase()))
            }
            isOptionEqualToValue={(option, value) => option.chainId === value.chainId}
            onChange={(_, data) => {
              updateSelectedNetwork(data)
              return field.onChange(data)
            }}
          />
        )}
        rules={{ required: true }}
      />
    </>
  )
}

export default NetworkMultiSelector
