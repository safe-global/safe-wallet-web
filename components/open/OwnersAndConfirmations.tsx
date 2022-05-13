import React from 'react'
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useFieldArray, useForm } from 'react-hook-form'

import { CreateSafeFormData } from '@/components/open/index'
import useWallet from '@/services/wallets/useWallet'
import { validateAddress } from '@/services/validation'
import { StepRenderProps } from '@/components/tx/TxStepper'

type Props = {
  params: CreateSafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
}

const OwnersAndConfirmations = ({ params, onSubmit, onBack }: Props) => {
  const wallet = useWallet()
  const defaultOwner = {
    name: '',
    address: wallet?.address,
  }
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateSafeFormData>({
    defaultValues: { name: params.name, owners: [defaultOwner], threshold: 1 },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'owners',
  })

  const addOwner = () => {
    append({ name: '', address: '' })
  }

  return (
    <Paper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box padding={3}>
          <Typography variant="body1">
            Your Safe will have one or more owners. We have prefilled the first owner with your connected wallet
            details, but you are free to change this to a different owner.
          </Typography>
          <Typography>
            Add additional owners (e.g. wallets of your teammates) and specify how many of them have to confirm a
            transaction before it gets executed. In general, the more confirmations required, the more secure your Safe
            is.Learn about which Safe setup to use. The new Safe will ONLY be available on NETWORK_NAME
          </Typography>
        </Box>
        <Divider />
        <Grid container gap={3} flexWrap="nowrap" paddingX={3} paddingY={1}>
          <Grid item xs={6}>
            Name
          </Grid>
          <Grid item xs={6}>
            Address
          </Grid>
        </Grid>
        <Divider />
        <Box padding={3}>
          {fields.map((field, index) => {
            return (
              <Grid container key={field.id} gap={3} marginBottom={3} flexWrap="nowrap">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <TextField
                      label="Owner name"
                      InputLabelProps={{ shrink: true }}
                      {...register(`owners.${index}.name`)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={7}>
                  <FormControl fullWidth>
                    <TextField
                      label="Owner address"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.owners?.[index]}
                      helperText={errors.owners?.[index]?.address?.message}
                      {...register(`owners.${index}.address`, {
                        validate: validateAddress,
                        required: true,
                      })}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={1} display="flex" alignItems="center">
                  {index > 0 && (
                    <IconButton onClick={() => remove(index)}>
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            )
          })}
          <Button onClick={addOwner}>+ Add another owner</Button>
          <Typography marginTop={3} marginBottom={1}>
            Any transaction requires the confirmation of:
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl>
              <Select {...register('threshold')} defaultValue={1}>
                {fields.map((field, index) => {
                  return (
                    <MenuItem key={field.id} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <Typography>out of {fields.length} owner(s)</Typography>
          </Box>
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

export default OwnersAndConfirmations
