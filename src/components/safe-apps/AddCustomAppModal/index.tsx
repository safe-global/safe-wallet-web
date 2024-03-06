import ModalDialog from '@/components/common/ModalDialog'
import { useShareSafeAppUrl } from '@/components/safe-apps/hooks/useShareSafeAppUrl'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useDebounce from '@/hooks/useDebounce'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import { fetchSafeAppFromManifest } from '@/services/safe-apps/manifest'
import { isSameUrl, trimTrailingSlash } from '@/utils/url'
import { isValidURL } from '@/utils/validation'
import CheckIcon from '@mui/icons-material/Check'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from '@mui/material'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import CustomApp from './CustomApp'
import CustomAppPlaceholder from './CustomAppPlaceholder'

import ExternalLink from '@/components/common/ExternalLink'
import css from './styles.module.css'

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

const HELP_LINK = 'https://docs.safe.global/apps-sdk-overview'
const APP_ALREADY_IN_THE_LIST_ERROR = 'This Safe App is already in the list'
const MANIFEST_ERROR = "The app doesn't support Safe App functionality"
const INVALID_URL_ERROR = 'The url is invalid'

export const AddCustomAppModal = ({ open, onClose, onSave, safeAppsList }: Props) => {
  const currentChain = useCurrentChain()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<CustomAppFormData>({ defaultValues: { riskAcknowledgement: false }, mode: 'onChange' })

  const onSubmit: SubmitHandler<CustomAppFormData> = (_, __) => {
    if (safeApp) {
      onSave(safeApp)
      trackSafeAppEvent(SAFE_APPS_EVENTS.ADD_CUSTOM_APP, safeApp.url)
      reset()
      onClose()
    }
  }

  const appUrl = watch('appUrl')
  const debouncedUrl = useDebounce(trimTrailingSlash(appUrl || ''), 300)

  const [safeApp, manifestError] = useAsync<SafeAppData | undefined>(() => {
    if (!isValidURL(debouncedUrl)) return

    return fetchSafeAppFromManifest(debouncedUrl, currentChain?.chainId || '')
  }, [currentChain, debouncedUrl])

  const handleClose = () => {
    reset()
    onClose()
  }

  const isAppAlreadyInTheList = useCallback(
    (appUrl: string) => safeAppsList.some((app) => isSameUrl(app.url, appUrl)),
    [safeAppsList],
  )

  const shareSafeAppUrl = useShareSafeAppUrl(safeApp?.url || '')
  const isSafeAppValid = isValid && safeApp
  const isCustomAppInTheDefaultList = errors?.appUrl?.type === 'alreadyExists'

  return (
    <ModalDialog open={open} onClose={handleClose} dialogTitle="Add custom Safe App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className={css.addCustomAppContainer}>
          <div data-sid="37414" className={css.addCustomAppFields}>
            <TextField
              required
              label="Safe App URL"
              error={errors?.appUrl?.type === 'validUrl'}
              helperText={errors?.appUrl?.type === 'validUrl' && errors?.appUrl?.message}
              autoComplete="off"
              {...register('appUrl', {
                required: true,
                validate: {
                  validUrl: (val: string) => (isValidURL(val) ? undefined : INVALID_URL_ERROR),
                  alreadyExists: (val: string) =>
                    isAppAlreadyInTheList(val) ? APP_ALREADY_IN_THE_LIST_ERROR : undefined,
                },
              })}
            />
            <Box data-sid="97667" mt={2}>
              {safeApp ? (
                <>
                  <CustomApp safeApp={safeApp} shareUrl={isCustomAppInTheDefaultList ? shareSafeAppUrl : ''} />
                  {isCustomAppInTheDefaultList ? (
                    <Box data-sid="36883" display="flex" mt={2} alignItems="center">
                      <CheckIcon color="success" />
                      <Typography ml={1}>This Safe App is already registered</Typography>
                    </Box>
                  ) : (
                    <>
                      <FormControlLabel
                        aria-required
                        control={
                          <Checkbox
                            {...register('riskAcknowledgement', {
                              required: true,
                            })}
                          />
                        }
                        label="This Safe App is not part of Safe{Wallet} and I agree to use it at my own risk."
                        sx={{ mt: 2 }}
                      />

                      {errors.riskAcknowledgement && (
                        <FormHelperText error>Accepting the disclaimer is mandatory</FormHelperText>
                      )}
                    </>
                  )}
                </>
              ) : (
                <CustomAppPlaceholder error={isValidURL(debouncedUrl) && manifestError ? MANIFEST_ERROR : ''} />
              )}
            </Box>
          </div>

          <div data-sid="24241" className={css.addCustomAppHelp}>
            <InfoOutlinedIcon className={css.addCustomAppHelpIcon} />
            <Typography ml={0.5}>Learn more about building</Typography>
            <ExternalLink className={css.addCustomAppHelpLink} href={HELP_LINK} fontWeight={700}>
              Safe Apps
            </ExternalLink>
            .
          </div>
        </DialogContent>

        <DialogActions disableSpacing>
          <Button data-sid="67995" onClick={handleClose}>
            Cancel
          </Button>
          <Button data-sid="67203" type="submit" variant="contained" disabled={!isSafeAppValid}>
            Add
          </Button>
        </DialogActions>
      </form>
    </ModalDialog>
  )
}
