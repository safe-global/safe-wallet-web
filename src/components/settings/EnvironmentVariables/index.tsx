import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Paper, Grid, Typography, TextField, Button, Tooltip, IconButton } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setCgw } from '@/store/settingsSlice'
import { GATEWAY_URL_PRODUCTION } from '@/config/constants'

export enum EnvVariablesField {
  cgw = 'cgw',
}

export type EnvVariablesFormData = {
  [EnvVariablesField.cgw]: string
}

const EnvironmentVariables = () => {
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()

  const formMethods = useForm<EnvVariablesFormData>({
    mode: 'onChange',
    defaultValues: {
      [EnvVariablesField.cgw]: settings.env.cgw ?? '',
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = formMethods

  const cgw = watch(EnvVariablesField.cgw)

  const onSubmit = handleSubmit((data) => {
    dispatch(setCgw(data[EnvVariablesField.cgw]))
  })

  const onResetCgw = () => {
    setValue(EnvVariablesField.cgw, '')
  }

  useEffect(() => {
    reset({ [EnvVariablesField.cgw]: settings.env.cgw })
  }, [reset, settings.env.cgw])

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Environment variables
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={3}>
            You can override some of our default APIs here in case you need to. Proceed at your own risk.
          </Typography>
          <FormProvider {...formMethods}>
            <form onSubmit={onSubmit}>
              <Typography fontWeight={700} mb={1}>
                Client gateway
              </Typography>
              <TextField
                {...register(EnvVariablesField.cgw)}
                variant="outlined"
                placeholder={!cgw ? GATEWAY_URL_PRODUCTION : ''}
                InputProps={{
                  endAdornment: cgw ? (
                    <InputAdornment position="end">
                      <Tooltip title="Reset to default value">
                        <IconButton onClick={onResetCgw} size="small" color="primary">
                          <RotateLeftIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Save
              </Button>
            </form>
          </FormProvider>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default EnvironmentVariables
