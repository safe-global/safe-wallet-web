import React, { useEffect } from 'react'
import { Box, Button, CircularProgress, Divider, Grid, InputAdornment, Link, Paper, Typography } from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import AddressInput from '@/components/common/AddressInput'
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import { parsePrefixedAddress } from '@/utils/addresses'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import NameInput from '@/components/common/NameInput'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { SafeFormData } from '@/components/create-safe/types'

type Props = {
  params: SafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SetAddressStep = ({ params, onSubmit, onBack }: Props) => {
  console.log(params)
  const fallbackName = useMnemonicSafeName()
  const currentChainId = useChainId()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, currentChainId))
  const formMethods = useForm<SafeFormData>({
    mode: 'onChange',
    defaultValues: {
      name: params?.name || fallbackName,
      address: params?.address,
    },
  })

  const { register, handleSubmit, watch, setValue, formState } = formMethods

  const safeAddress = watch('address')

  const { name, resolving } = useAddressResolver(safeAddress)

  useEffect(() => {
    name && setValue(`name`, name)
  }, [name, setValue])

  const validateSafeAddress = async (address: string) => {
    const { address: safeAddress } = parsePrefixedAddress(address)

    if (addedSafes && Object.keys(addedSafes).includes(safeAddress)) {
      return 'Safe is already added'
    }

    try {
      await getSafeInfo(currentChainId, safeAddress)
    } catch (error) {
      return 'Address given is not a valid Safe address'
    }
  }

  return (
    <FormProvider {...formMethods}>
      <Paper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box padding={3}>
            <Typography variant="body1" mb={2}>
              You are about to add an existing Safe on <ChainIndicator inline />. First, choose a name and enter the
              Safe address. The name is only stored locally and will never be shared with Gnosis or any third parties.
              Your connected wallet does not have to be the owner of this Safe. In this case, the interface will provide
              you a read-only view.
            </Typography>
            <Typography mb={3}>
              Don&apos;t have the address of the Safe you created?{' '}
              <Link
                href="https://help.gnosis-safe.io/en/articles/4971293-i-don-t-remember-my-safe-address-where-can-i-find-it"
                target="_blank"
                rel="noreferrer"
              >
                This article explains how to find it.
              </Link>
            </Typography>
            <Box marginBottom={2} paddingRight={6} width={{ lg: '50%' }}>
              <NameInput
                name="safe.name"
                label="Safe name"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: resolving && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </Box>
            <Box width={{ lg: '50%' }}>
              <AddressInput
                label="Safe address"
                validate={validateSafeAddress}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: resolving && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
                {...register('address')}
              />
            </Box>
            <Typography mt={2}>
              By continuing you consent to the{' '}
              <Link href="https://gnosis-safe.io/terms" target="_blank" rel="noreferrer">
                terms of use
              </Link>{' '}
              and{' '}
              <Link href="https://gnosis-safe.io/privacy" target="_blank" rel="noreferrer">
                privacy policy
              </Link>
              .
            </Typography>
          </Box>
          <Divider />
          <Box padding={3}>
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onBack}>Back</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit" disabled={!formState.isValid}>
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  )
}

export default SetAddressStep
