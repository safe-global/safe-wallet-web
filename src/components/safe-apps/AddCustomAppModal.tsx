import * as React from 'react'
import type { SubmitHandler } from 'react-hook-form'
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
  SvgIcon,
  InputAdornment,
} from '@mui/material'
import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ModalDialog from '@/components/common/ModalDialog'
import { isValidURL } from '@/utils/validation'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import useChainId from '@/hooks/useChainId'
import { trimTrailingSlash, isSameUrl } from '@/utils/url'
import useAsync from '@/hooks/useAsync'
import useDebounce from '@/hooks/useDebounce'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import SafeAppIcon from '@/public/images/apps/apps-icon.svg'

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

const TEXT_FIELD_SIZE = '56px'
const HELP_LINK = 'https://docs.gnosis-safe.io/build/sdks/safe-apps'

const AddCustomAppModal = ({ open, onClose, onSave, safeAppsList }: Props) => {
  const chainId = useChainId()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    reset,
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false }, mode: 'onChange' })

  const onSubmit: SubmitHandler<CustomAppFormData> = (_, __) => {
    if (safeApp) {
      onSave(safeApp)
      trackEvent(SAFE_APPS_EVENTS.ADD_CUSTOM_APP)
      onClose()
    }
  }

  const appUrl = watch('appUrl')
  const debouncedUrl = useDebounce(trimTrailingSlash(appUrl || ''), 300)

  const [safeApp] = useAsync<SafeAppData | undefined>(() => {
    if (!isValidURL(debouncedUrl)) return

    return fetchSafeAppFromManifest(debouncedUrl, chainId).catch(() => {
      setError('appUrl', { type: 'custom', message: "The app doesn't support Safe App functionality" })
      return undefined
    })
  }, [chainId, debouncedUrl])

  const handleClose = () => {
    reset()
    onClose()
  }

  const isAppAlreadyInTheList = (appUrl: string) => safeAppsList.some((app) => isSameUrl(app.url, appUrl))

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
            {/* <img
                src={safeApp.iconUrl}
                alt="Apps icon"
                height={TEXT_FIELD_SIZE}
                width={TEXT_FIELD_SIZE}
                style={{ transition: 'all ease-in 1s' }}
              /> */}

            <TextField
              disabled
              sx={({ palette }) => ({
                width: '100%',
                ml: 2,
                WebkitTextFillColor: palette.text.secondary,
                '&& input': {
                  WebkitTextFillColor: safeApp?.name && palette.text.primary,
                },
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon component={SafeAppIcon} inheritViewBox />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              value="App card"
            />
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
            label="This app is not part of Safe and I agree to use it at my own risk."
            sx={{ mt: 2 }}
          />
          {errors.riskAcknowledgement && <FormHelperText error>Required</FormHelperText>}
          <Box display="flex" alignItems="center" mt={2}>
            <InfoOutlinedIcon />
            <Typography ml={1}>Learn more about building</Typography>
            <Link
              href={HELP_LINK}
              target="_blank"
              rel="noreferrer"
              fontWeight={700}
              sx={{ textDecoration: 'none' }}
              ml={1}
            >
              Safe Apps.
            </Link>
          </Box>
        </DialogContent>
        <DialogActions disableSpacing>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!isValid || !safeApp}>
            Add
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  )
}

export { AddCustomAppModal }
