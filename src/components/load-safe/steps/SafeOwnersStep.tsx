import type { ReactElement } from 'react'
import React, { useEffect } from 'react'
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import useAsync from '@/hooks/useAsync'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { OwnerRow } from '@/components/create-safe/steps/OwnerRow'
import useChainId from '@/hooks/useChainId'
import type { SafeFormData } from '@/components/create-safe/types'

type Props = {
  params: SafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SafeOwnersStep = ({ params, onSubmit, onBack }: Props): ReactElement => {
  const chainId = useChainId()
  const formMethods = useForm<SafeFormData>({ defaultValues: params, mode: 'onChange' })
  const { handleSubmit, setValue, control, formState, getValues } = formMethods

  const { fields } = useFieldArray({
    control,
    name: 'owners',
  })

  const [safeInfo] = useAsync<SafeInfo>(() => {
    if (params.address) {
      return getSafeInfo(chainId, params.address)
    }
  }, [chainId, params.address])

  useEffect(() => {
    if (!safeInfo) return

    setValue('threshold', safeInfo.threshold)

    const owners = safeInfo.owners.map((owner, i) => ({
      address: owner.value,
      name: getValues(`owners.${i}.name`) || '',
    }))

    setValue('owners', owners)
  }, [getValues, safeInfo, setValue])

  const onFormBack = () => {
    onBack(getValues())
  }

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
              <OwnerRow key={field.id} index={index} groupName="owners" readOnly />
            ))}
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onFormBack}>Back</Button>
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
