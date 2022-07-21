import * as React from 'react'
import { useForm } from 'react-hook-form'
import {
  DialogActions,
  DialogContent,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Box,
  FormHelperText,
} from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import { isValidURL } from '@/utils/validation'

type Props = {
  open: boolean
  onClose: () => void
}

type CustomAppFormData = {
  appUrl: string
  riskAcknowledgement: boolean
}

const TEXT_FIELD_HEIGHT = '56px'

const AddCustomAppModal = ({ open, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false } })
  const onSubmit = (data, e) => console.log(data, e)

  return (
    <ModalDialog open={open} onClose={onClose} dialogTitle="Add custom app">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            required
            label="App URL"
            autoComplete="off"
            sx={{ mt: 2 }}
            error={!!errors.appUrl}
            helperText={errors.appUrl?.message}
            {...register('appUrl', {
              required: true,
              validate: {
                validUrl: isValidURL,
              },
            })}
          />
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              mt: 2,
            }}
          >
            <img height={TEXT_FIELD_HEIGHT} src="/images/apps-icon.svg" alt="Apps icon" />
            <TextField label="App name" disabled sx={{ width: '100%', ml: 2 }} />
          </Box>
          <FormControlLabel
            aria-required
            control={
              <Checkbox
                {...register('riskAcknowledgement', {
                  required: true,
                })}
              />
            }
            label="This app is not a Gnosis product and I agree to use this app at my own risk."
            sx={{ mt: 2 }}
          />
          {errors.riskAcknowledgement && <FormHelperText error>Required</FormHelperText>}
          <Typography mt={2}>
            <Link href="https://docs.gnosis-safe.io/build/sdks/safe-apps" target="_blank">
              Learn more about building Safe Apps.
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  )
}

export { AddCustomAppModal }
