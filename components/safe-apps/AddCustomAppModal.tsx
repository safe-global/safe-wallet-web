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
import ModalDialog from '@/components/common/ModalDialog'
import { isValidURL } from '@/utils/validation'
import { AppManifest, fetchAppManifest, isAppManifestValid } from '@/services/safe-apps/manifest'
import ChainIndicator from '@/components/common/ChainIndicator'
import { trimTrailingSlash } from '@/utils/url'

type Props = {
  open: boolean
  onClose: () => void
}

type CustomAppFormData = {
  appUrl: string
  riskAcknowledgement: boolean
}

const TEXT_FIELD_HEIGHT = '56px'
const APP_LOGO_FALLBACK_IMAGE = '/images/apps-icon.svg'

// The icons URL can be any of the following format:
// - https://example.com/icon.png
// - icon.png
// - /icon.png
// This function calculates the absolute URL of the icon taking into account the
// different formats.
const getAppLogoUrl = (appUrl: string, icons: AppManifest['icons']) => {
  const iconUrl = icons[0].src
  const includesBaseUrl = iconUrl.startsWith('https://')
  if (includesBaseUrl) {
    return iconUrl
  }

  const isAbsoluteUrl = iconUrl.startsWith('/')
  if (isAbsoluteUrl) {
    const appUrlHost = new URL(appUrl).host
    return `${appUrlHost}${iconUrl}`
  }

  return `${appUrl}/${icons[0].src}`
}

const AddCustomAppModal = ({ open, onClose }: Props) => {
  const [appManifest, setAppManifest] = React.useState<AppManifest>()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false } })
  const appUrl = watch('appUrl')
  const onSubmit: SubmitHandler<CustomAppFormData> = (data, e) => console.log(data, e)

  let appLogoUrl = APP_LOGO_FALLBACK_IMAGE
  if (appManifest && appManifest.icons.length > 0) {
    appLogoUrl = getAppLogoUrl(trimTrailingSlash(appUrl), appManifest.icons)
  }

  const handleClose = () => {
    setAppManifest(undefined)
    onClose()
  }

  return (
    <ModalDialog
      open={open}
      onClose={handleClose}
      dialogTitle={
        <>
          <span>Add custom app</span>
          <span style={{ flex: 1 }} />
          <ChainIndicator inline />
        </>
      }
    >
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
                validManifest: async (val): Promise<string | undefined> => {
                  try {
                    setAppManifest(undefined)
                    const manifest = await fetchAppManifest(val)

                    if (isAppManifestValid(manifest)) {
                      setAppManifest(manifest)
                      return
                    }

                    throw new Error('Invalid manifest')
                  } catch (err) {
                    return "The app doesn't support Safe App functionality"
                  }
                },
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
            <TextField label="App name" disabled sx={{ width: '100%', ml: 2 }} value={appManifest?.name || ''} />
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
