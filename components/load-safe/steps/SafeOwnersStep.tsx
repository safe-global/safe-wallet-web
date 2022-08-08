import React, { ReactElement, useEffect } from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import { LoadSafeFormData } from '@/components/load-safe'
import useAsync from '@/hooks/useAsync'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { parsePrefixedAddress } from '@/utils/addresses'

import { OwnerRow } from '@/components/create-safe/steps/OwnerRow'

type Props = {
  params: LoadSafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SafeOwnersStep = ({ params, onSubmit, onBack }: Props): ReactElement => {
  const formMethods = useForm<LoadSafeFormData>({ defaultValues: params, mode: 'onChange' })
  const { handleSubmit, setValue, control, formState } = formMethods

  const { fields } = useFieldArray({
    control,
    name: 'owners',
  })

  const [safeInfo] = useAsync<SafeInfo | undefined>(async () => {
    if (!params.chainId || !params.safeAddress.address) return
    const { address } = parsePrefixedAddress(params.safeAddress.address)

    return getSafeInfo(params.chainId, address)
  }, [params.chainId, params.safeAddress.address])

  useEffect(() => {
    if (!safeInfo) return

    setValue('threshold', safeInfo.threshold)
    setValue(
      'owners',
      safeInfo.owners.map((owner) => ({ address: owner.value, name: '', resolving: false })),
    )
  }, [safeInfo, setValue])

  return (
    <Paper>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box padding={3}>
            <Typography mb={2}>
              This Safe on <ChainIndicator inline /> has {safeInfo?.owners.length} owners. Optional: Provide a name for
              each owner.
            </Typography>
          </Box>
          <Divider />
          <Grid container gap={3} flexWrap="nowrap" paddingX={3} paddingY={1}>
            <Grid item xs={12} md={4}>
              Name
            </Grid>
            <Grid item xs={12} md={7}>
              Address
            </Grid>
          </Grid>
          <Divider />
          <Box padding={3}>
            {fields.map((field, index) => (
              <OwnerRow key={field.id} field={field} index={index} disabled />
            ))}
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
      </FormProvider>
    </Paper>
  )
}

export default SafeOwnersStep
