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
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { getSafeSingletonDeployment } from '@safe-global/safe-deployments'

const NetworkMultiSelector = ({
  name,
  isAdvancedFlow = false,
}: {
  name: string
  isAdvancedFlow?: boolean
}): ReactElement => {
  const { configs } = useChains()
  const router = useRouter()
  const isWalletConnected = !!useWallet()

  const {
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useFormContext()

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
    router.replace(networkLink)
  }

  const isOptionDisabled = (optionNetwork: ChainInfo) => {
    if (selectedNetworks.length === 0) return false
    const firstSelectedNetwork = selectedNetworks[0]

    // do not allow multi chain safes for advanced setup flow.
    if (isAdvancedFlow) return optionNetwork.chainId != firstSelectedNetwork.chainId

    const optionHasCanonicalSingletonDeployment = Boolean(
      getSafeSingletonDeployment({ network: optionNetwork.chainId, version: LATEST_SAFE_VERSION })?.deployments
        .canonical,
    )
    const selectedHasCanonicalSingletonDeployment = Boolean(
      getSafeSingletonDeployment({ network: firstSelectedNetwork.chainId, version: LATEST_SAFE_VERSION })?.deployments
        .canonical,
    )

    // Only 1.4.1 safes with canonical deployment addresses can be deployed as part of a multichain group
    if (!selectedHasCanonicalSingletonDeployment) return firstSelectedNetwork.chainId !== optionNetwork.chainId
    return !optionHasCanonicalSingletonDeployment
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
            renderTags={(selectedOptions) =>
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
