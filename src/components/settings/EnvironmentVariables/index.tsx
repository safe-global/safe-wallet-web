import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Paper, Grid, Typography, TextField, Button, Tooltip, IconButton } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setCgw, setRpc, setTenderly } from '@/store/settingsSlice'
import { GATEWAY_URL_PRODUCTION, TENDERLY_SIMULATE_ENDPOINT_URL } from '@/config/constants'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'

export enum EnvVariablesField {
  cgw = 'cgw',
  rpc = 'rpc',
  tenderly = 'tenderly',
}

export type EnvVariablesFormData = {
  [EnvVariablesField.cgw]: string
  [EnvVariablesField.rpc]: string
  [EnvVariablesField.tenderly]: string
}

const EnvironmentVariables = () => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()

  const formMethods = useForm<EnvVariablesFormData>({
    mode: 'onChange',
    defaultValues: {
      [EnvVariablesField.cgw]: settings.env.cgw ?? '',
      [EnvVariablesField.rpc]: settings.env.rpc[chainId] ?? '',
      [EnvVariablesField.tenderly]: settings.env.tenderly ?? '',
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = formMethods

  const cgw = watch(EnvVariablesField.cgw)
  const rpc = watch(EnvVariablesField.rpc)
  const tenderly = watch(EnvVariablesField.tenderly)

  const onSubmit = handleSubmit((data) => {
    trackEvent({ ...SETTINGS_EVENTS.ENV_VARIABLES.SAVE })
    dispatch(setCgw(data[EnvVariablesField.cgw]))
    dispatch(setRpc({ chainId, rpc: data[EnvVariablesField.rpc] }))
    dispatch(setTenderly(data[EnvVariablesField.tenderly]))
    location.reload()
  })

  const onReset = (name: EnvVariablesField) => {
    setValue(name, '')
  }

  useEffect(() => {
    reset({ [EnvVariablesField.cgw]: settings.env.cgw })
  }, [reset, settings.env.cgw])

  useEffect(() => {
    reset({ [EnvVariablesField.rpc]: settings.env.rpc[chainId] })
  }, [reset, settings.env.rpc, chainId])

  useEffect(() => {
    reset({ [EnvVariablesField.tenderly]: settings.env.tenderly })
  }, [reset, settings.env.tenderly])

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
                placeholder={GATEWAY_URL_PRODUCTION}
                InputProps={{
                  endAdornment: cgw ? (
                    <InputAdornment position="end">
                      <Tooltip title="Reset to default value">
                        <IconButton onClick={() => onReset(EnvVariablesField.cgw)} size="small" color="primary">
                          <RotateLeftIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
                fullWidth
              />

              <Typography fontWeight={700} mb={1} mt={2}>
                RPC provider
              </Typography>
              <TextField
                {...register(EnvVariablesField.rpc)}
                variant="outlined"
                placeholder={chain?.rpcUri.value}
                InputProps={{
                  endAdornment: rpc ? (
                    <InputAdornment position="end">
                      <Tooltip title="Reset to default value">
                        <IconButton onClick={() => onReset(EnvVariablesField.rpc)} size="small" color="primary">
                          <RotateLeftIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : null,
                }}
                fullWidth
              />

              <Typography fontWeight={700} mb={1} mt={2}>
                Tenderly
              </Typography>
              <TextField
                {...register(EnvVariablesField.tenderly)}
                variant="outlined"
                placeholder={TENDERLY_SIMULATE_ENDPOINT_URL}
                InputProps={{
                  endAdornment: tenderly ? (
                    <InputAdornment position="end">
                      <Tooltip title="Reset to default value">
                        <IconButton onClick={() => onReset(EnvVariablesField.tenderly)} size="small" color="primary">
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
