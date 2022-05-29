import React from 'react'
import { Box, Button, Divider, FormControl, Grid, Paper, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import { CreateSafeFormData } from '@/components/open/index'
import { useMnemonicSafeName } from '@/services/useMnemonicName'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import ChainIndicator from '@/components/common/ChainIndicator'
import css from '@/components/common/NetworkSelector/styles.module.css'

type Props = {
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const SetName = ({ onSubmit, onBack }: Props) => {
  const fallbackName = useMnemonicSafeName()
  const { register, handleSubmit } = useForm<CreateSafeFormData>({ defaultValues: { name: fallbackName } })

  return (
    <Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box padding={3}>
          <Typography variant="body1" mb={2}>
            You are about to create a new Gnosis Safe wallet with one or more owners. First, let&apos;s give your new
            wallet a name. This name is only stored locally and will never be shared with Gnosis or any third parties.
            The new Safe will ONLY be available on <ChainIndicator className={css.inlineIndicator} />
          </Typography>
          <FormControl>
            <TextField
              label="Safe name"
              InputLabelProps={{ shrink: true }}
              {...register('name')}
              placeholder={fallbackName}
            />
          </FormControl>
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
  )
}

export default SetName
