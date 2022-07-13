import { ReactElement, useEffect } from 'react'
import { Box, Button, Divider, FormControl, Grid, Paper, TextField, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import AddressInput from 'components/common/AddressInput'
import { LoadSafeFormData } from '@/components/load-safe'
import useAsync from '@/hooks/useAsync'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import useChainId from '@/hooks/useChainId'
import { parsePrefixedAddress } from '@/utils/addresses'

type Props = {
  params: LoadSafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SafeOwnersStep = ({ params, onSubmit, onBack }: Props): ReactElement => {
  const currentChainId = useChainId()
  const formMethods = useForm<LoadSafeFormData>({ defaultValues: params })
  const { register, handleSubmit, setValue } = formMethods

  const [safeInfo, error, loading] = useAsync<SafeInfo | undefined>(async () => {
    if (!currentChainId || !params.address) return
    const { address } = parsePrefixedAddress(params.address)

    return await getSafeInfo(currentChainId, address)
  }, [currentChainId, params.address])

  useEffect(() => {
    if (!safeInfo) return

    setValue('safeInfo', safeInfo)
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
            {safeInfo &&
              safeInfo.owners.map((owner, index) => {
                return (
                  <Grid
                    container
                    key={owner.value}
                    gap={3}
                    marginBottom={3}
                    flexWrap={[undefined, undefined, 'nowrap']}
                  >
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <TextField
                          label="Owner name"
                          InputLabelProps={{ shrink: true }}
                          {...register(`safeInfo.owners.${index}.name`)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <FormControl fullWidth>
                        <AddressInput
                          label="Owner address"
                          name={`safeInfo.owners.${index}.value`}
                          disabled
                          InputLabelProps={{ shrink: true }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                )
              })}
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
      </FormProvider>
    </Paper>
  )
}

export default SafeOwnersStep
