import useChains from '@/hooks/useChains'
import { type ReactElement } from 'react'
import { Checkbox, Autocomplete, TextField, Chip } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { getNetworkLink } from '.'
import useWallet from '@/hooks/wallets/useWallet'
import { SetNameStepFields } from '@/components/new-safe/create/steps/SetNameStep'
import { getLatestSafeVersion } from '@/utils/chains'

const ZKSYNC_ID = '324'

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

  const selectedSafeVersion = useWatch({ control, name: SetNameStepFields.safeVersion })
  const selectedNetworks = useWatch({ control, name: SetNameStepFields.networks })

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

  const isOptionDisabled = (chain: ChainInfo) => {
    if (selectedNetworks.length === 0) return false

    // zkSync safes cannot be deployed as part of a multichain group
    const isZkSync = chain.chainId === ZKSYNC_ID
    const isZkSyncSelected = selectedNetworks[0].chainId === ZKSYNC_ID
    if (isZkSyncSelected) return !isZkSync
    if (selectedNetworks.length > 0 && isZkSync) return true

    // Safes in a multichain group must have the same version
    const safeVersion = getLatestSafeVersion(chain)
    return safeVersion !== selectedSafeVersion
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
            getOptionDisabled={isOptionDisabled}
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
