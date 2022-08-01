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
  const [safeApp, setSafeApp] = React.useState<SafeAppData>()
  const chainId = useChainId()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields, isValidating },
    watch,
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false }, mode: 'onChange' })
  const appUrl = watch('appUrl')

  const onSubmit: SubmitHandler<CustomAppFormData> = (_, __) => {
    if (safeApp) {
      onSave(safeApp)
      onClose()
    }
  }

  React.useEffect(() => {
    const loadApp = async () => {
      try {
        setSafeApp(undefined)
        const appFromManifest = await fetchSafeAppFromManifest(appUrl, chainId)
        setSafeApp(appFromManifest)
      } catch (err) {
        setError('appUrl', { type: 'custom', message: "The app doesn't support Safe App functionality" })
      }
    }

    if (!isValidating && dirtyFields.appUrl && !errors.appUrl) loadApp()
  }, [appUrl, chainId, setError, errors.appUrl, isValidating, dirtyFields.appUrl])

  const appLogoUrl = safeApp?.iconUrl || APP_LOGO_FALLBACK_IMAGE

  const handleClose = () => {
    setSafeApp(undefined)
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
            helperText={errors.appUrl?.message}
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
            <img
              height={TEXT_FIELD_HEIGHT}
              src={appLogoUrl}
              alt="Apps icon"
              onError={(e) => {
                e.currentTarget.src = APP_LOGO_FALLBACK_IMAGE
              }}
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
