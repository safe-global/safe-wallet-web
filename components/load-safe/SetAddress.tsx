import React from 'react'
import { Box, Button, Divider, Grid, Paper, TextField, Typography } from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import { LoadSafeFormData } from '@/components/load-safe/index'
import AddressInput from '@/components/common/AddressInput'
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import { parsePrefixedAddress } from '@/utils/addresses'

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SetAddress = ({ onSubmit, onBack }: Props) => {
  const currentChainId = useChainId()
  const fallbackName = useMnemonicSafeName()
  const formMethods = useForm<LoadSafeFormData>({ defaultValues: { name: fallbackName } })

  const { register, handleSubmit } = formMethods

  const validateSafeAddress = async (address: string) => {
    const { address: safeAddress } = parsePrefixedAddress(address)
    try {
      await getSafeInfo(currentChainId, safeAddress)
    } catch (error) {
      return 'Address given is not a valid Safe address'
    }
    return
  }

  return (
    <FormProvider {...formMethods}>
      <Paper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box padding={3}>
            <Typography variant="body1" mb={2}>
              You are about to add an existing Gnosis Safe on <ChainIndicator inline />. First, choose a name and enter
              the Safe address. The name is only stored locally and will never be shared with Gnosis or any third
              parties. Your connected wallet does not have to be the owner of this Safe. In this case, the interface
              will provide you a read-only view. Don&apos;t have the address of the Safe you created?{' '}
              <a
                href="https://help.gnosis-safe.io/en/articles/4971293-i-don-t-remember-my-safe-address-where-can-i-find-it"
                target="_blank"
                rel="noreferrer"
              >
                This article explains how to find it.
              </a>
            </Typography>
            <Box marginBottom={2} maxWidth={500} paddingRight={6}>
              <TextField
                label="Safe name"
                InputLabelProps={{ shrink: true }}
                {...register('name')}
                placeholder={fallbackName}
                fullWidth
              />
            </Box>
            <Box maxWidth={500}>
              <AddressInput
                name="address"
                label="Safe address"
                validate={validateSafeAddress}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Typography mt={2}>
              By continuing you consent to the <a href="#">terms of use</a> and <a href="#">privacy policy</a>.
            </Typography>
          </Box>
          <Divider />
          <Box padding={3}>
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onBack}>Back</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit">
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

export default SetAddress
