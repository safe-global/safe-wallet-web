import { VisibilityOff, Visibility } from '@mui/icons-material'
import {
  Typography,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Divider,
  Grid,
  LinearProgress,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type PasswordFormData = {
  password: string
}

export const PasswordRecovery = ({
  recoverFactorWithPassword,
}: {
  recoverFactorWithPassword: (password: string, storeDeviceFactor: boolean) => Promise<void>
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [storeDeviceFactor, setStoreDeviceFactor] = useState(false)

  const formMethods = useForm<PasswordFormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  })

  const { handleSubmit, register, formState, setError } = formMethods

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await recoverFactorWithPassword(data.password, storeDeviceFactor)
    } catch (e) {
      setError('password', { type: 'custom', message: 'Incorrect password' })
    }
  }

  const isDisabled = formState.isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12} md={5} p={2}>
          <Typography variant="h2" fontWeight="bold" mb={3}>
            Verify your account
          </Typography>
          <Box bgcolor="background.paper" borderRadius={1}>
            <LinearProgress
              color="secondary"
              sx={{ borderTopLeftRadius: '6px', borderTopRightRadius: '6px', opacity: isDisabled ? 1 : 0 }}
            />
            <Box p={4}>
              <Typography variant="h6" fontWeight="bold" mb={0.5}>
                Enter security password
              </Typography>
              <Typography>
                This browser is not registered with your Account yet. Please enter your recovery password to restore
                access to this Account.
              </Typography>
            </Box>
            <Divider />
            <Box p={4} display="flex" flexDirection="column" alignItems="baseline" gap={1}>
              {/* TODO: Reuse PasswordInput here */}
              <TextField
                fullWidth
                label="Recovery password"
                type={showPassword ? 'text' : 'password'}
                error={!!formState.errors['password']}
                helperText={formState.errors['password']?.message}
                disabled={isDisabled}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
                {...register('password', {
                  required: true,
                })}
              />
              <FormControlLabel
                disabled={isDisabled}
                control={<Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />}
                label="Do not ask again on this device"
              />
            </Box>
            <Divider />
            <Box p={4} display="flex" justifyContent="flex-end">
              <Button variant="contained" type="submit" disabled={isDisabled}>
                Submit
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}
