import * as React from 'react'
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
} from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import { validateTokenAmount } from '@/utils/validation'
import { useForm } from 'react-hook-form'
import { CreateSafeFormData } from '@/components/create-safe'

type Props = {
  open: boolean
  onClose: () => void
}

type CustomAppFormData = {
  appUrl: string
}

const TEXT_FIELD_HEIGHT = '56px'

const AddCustomAppModal = ({ open, onClose }: Props) => {
  const { register, handleSubmit } = useForm<CustomAppFormData>()

  return (
    <ModalDialog open={open} onClose={onClose} dialogTitle="Add custom app">
      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField label="App URL" autoComplete="off" sx={{ mt: 2 }} {...register('appUrl')} />
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
            control={<Checkbox />}
            label="This app is not a Gnosis product and I agree to use this app at my own risk."
            sx={{ mt: 2 }}
          />
          <Typography mt={2}>
            <Link href="https://docs.gnosis-safe.io/build/sdks/safe-apps" target="_blank">
              Learn more about building Safe Apps.
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={onClose}>
            Save
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  )
}

export { AddCustomAppModal }
