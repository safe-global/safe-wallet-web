import useChains from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useCallback, type ReactElement } from 'react'
import { Checkbox, Autocomplete, TextField, Chip } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '../ChainIndicator'
import css from './styles.module.css'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { getNetworkLink } from '.'
import useWallet from '@/hooks/wallets/useWallet'
import { SetNameStepFields } from '@/components/new-safe/create/steps/SetNameStep'
import { getSafeSingletonDeployment } from '@safe-global/safe-deployments'
import { getLatestSafeVersion } from '@/utils/chains'

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
  const safeAddress = useSafeAddress()

  const {
    formState: { errors },
    control,
    getValues,
    setValue,
  } = useFormContext()

  const selectedNetworks: ChainInfo[] = useWatch({ control, name: SetNameStepFields.networks })

  const updateSelectedNetwork = useCallback(
    (chains: ChainInfo[]) => {
      if (chains.length !== 1) return
      const shortName = chains[0].shortName
      const networkLink = getNetworkLink(router, safeAddress, shortName)
      router.replace(networkLink)
    },
    [isWalletConnected, router],
  )

  const handleDelete = useCallback(
    (deletedChainId: string) => {
      const currentValues: ChainInfo[] = getValues(name) || []
      const updatedValues = currentValues.filter((chain) => chain.chainId !== deletedChainId)
      updateSelectedNetwork(updatedValues)
      setValue(name, updatedValues)
    },
    [getValues, name, setValue, updateSelectedNetwork],
  )

  const isOptionDisabled = useCallback(
    (optionNetwork: ChainInfo) => {
      if (selectedNetworks.length === 0) return false
      const firstSelectedNetwork = selectedNetworks[0]

      // do not allow multi chain safes for advanced setup flow.
      if (isAdvancedFlow) return optionNetwork.chainId != firstSelectedNetwork.chainId

      const optionHasCanonicalSingletonDeployment = Boolean(
        getSafeSingletonDeployment({
          network: optionNetwork.chainId,
          version: getLatestSafeVersion(firstSelectedNetwork),
        })?.deployments.canonical,
      )
      const selectedHasCanonicalSingletonDeployment = Boolean(
        getSafeSingletonDeployment({
          network: firstSelectedNetwork.chainId,
          version: getLatestSafeVersion(firstSelectedNetwork),
        })?.deployments.canonical,
      )

      // Only 1.4.1 safes with canonical deployment addresses can be deployed as part of a multichain group
      if (!selectedHasCanonicalSingletonDeployment) return firstSelectedNetwork.chainId !== optionNetwork.chainId
      return !optionHasCanonicalSingletonDeployment
    },
    [isAdvancedFlow, selectedNetworks],
  )

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
