import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
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
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ModalDialog from '@/components/common/ModalDialog'
import { isValidURL } from '@/utils/validation'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useChainId from '@/hooks/useChainId'
import { trimTrailingSlash } from '@/utils/url'
import useAsync from '@/hooks/useAsync'
import useDebounce from '@/hooks/useDebounce'
import ImageFallback from '../common/ImageFallback'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (data: SafeAppData) => void
  // A list of safe apps to check if the app is already there
  safeAppsList: SafeAppData[]
}

type CustomAppFormData = {
  appUrl: string
  riskAcknowledgement: boolean
  safeApp: SafeAppData
}

const TEXT_FIELD_HEIGHT = '56px'
const APP_LOGO_FALLBACK_IMAGE = '/images/apps-icon.svg'

const AddCustomAppModal = ({ open, onClose, onSave, safeAppsList }: Props) => {
  const chainId = useChainId()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    reset,
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false }, mode: 'onChange' })

  const onSubmit: SubmitHandler<CustomAppFormData> = (_, __) => {
    if (safeApp) {
      onSave(safeApp)
      onClose()
    }
  }

  const appUrl = watch('appUrl')
  const debouncedUrl = useDebounce(trimTrailingSlash(appUrl || ''), 300)
  const [safeApp] = useAsync<SafeAppData | undefined>(async () => {
    if (!isValidURL(debouncedUrl)) {
      return
    }

    try {
      return await fetchSafeAppFromManifest(debouncedUrl, chainId)
    } catch (e) {
      setError('appUrl', { type: 'custom', message: "The App doesn't support Safe App functionality" })
    }
  }, [chainId, debouncedUrl])

  const appLogoUrl = safeApp?.iconUrl || APP_LOGO_FALLBACK_IMAGE

  const handleClose = () => {
    reset()
    onClose()
  }

  const isAppAlreadyInTheList = (appUrl: string) =>
    safeAppsList.some((app) => trimTrailingSlash(app.url) === trimTrailingSlash(appUrl))

  return (
    <ModalDialog open={open} onClose={handleClose} dialogTitle="Add custom app">
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
            helperText={errors.appUrl?.message || ' '}
            {...register('appUrl', {
              required: true,
              validate: {
                validUrl: (val: string) => (isValidURL(val) ? undefined : 'Invalid URL'),
                doesntExist: (val: string) =>
                  isAppAlreadyInTheList(val) ? 'This app is already in the list' : undefined,
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
            <ImageFallback
              height={TEXT_FIELD_HEIGHT}
              src={appLogoUrl}
              fallbackSrc={APP_LOGO_FALLBACK_IMAGE}
              alt="Apps icon"
            />
            <TextField label="App name" disabled sx={{ width: '100%', ml: 2 }} value={safeApp?.name || ''} />
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
        <DialogActions disableSpacing>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  )
}

export { AddCustomAppModal }
