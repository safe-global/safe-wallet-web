import { InputAdornment, Tooltip, SvgIcon, Typography, Box, Divider, Button, Grid } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'

import layoutCss from '@/components/new-safe/create/styles.module.css'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import NameInput from '@/components/common/NameInput'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import MUILink from '@mui/material/Link'
import Link from 'next/link'
import { useRouter } from 'next/router'
import NoWalletConnectedWarning from '../../NoWalletConnectedWarning'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { useCurrentChain } from '@/hooks/useChains'
import { useEffect, useState } from 'react'
import { getLatestSafeVersion } from '@/utils/chains'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import NetworkMultiSelector from '@/components/common/NetworkMultiSelector'

const checkedIcon = <CheckBoxIcon fontSize="small" />

type SetNameStepForm = {
  name: string
  safeVersion: SafeVersion
}

enum SetNameStepFields {
  name = 'name',
  safeVersion = 'safeVersion',
}

const SET_NAME_STEP_FORM_ID = 'create-safe-set-name-step-form'

function SetNameStep({
  data,
  onSubmit,
  setSafeName,
}: StepRenderProps<NewSafeFormData> & { setSafeName: (name: string) => void }) {
  const router = useRouter()
  const fallbackName = useMnemonicSafeName()
  const isWrongChain = useIsWrongChain()
  const chain = useCurrentChain()

  const [chains, setChains] = useState<string[]>([chain?.chainName || ''])

  const formMethods = useForm<SetNameStepForm>({
    mode: 'all',
    defaultValues: data,
  })

  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = formMethods

  const onFormSubmit = (data: Pick<NewSafeFormData, 'name' | 'chains'>) => {
    const name = data.name || fallbackName
    setSafeName(name)
    onSubmit({ ...data, name, chains })

    if (data.name) {
      trackEvent(CREATE_SAFE_EVENTS.NAME_SAFE)
    }
  }

  const onCancel = () => {
    trackEvent(CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE_FORM)
    router.push(AppRoutes.welcome.index)
  }

  // whenever the chain switches we need to update the latest Safe version
  useEffect(() => {
    setValue(SetNameStepFields.safeVersion, getLatestSafeVersion(chain))
  }, [chain, setValue])

  const isDisabled = isWrongChain || !isValid

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)} id={SET_NAME_STEP_FORM_ID}>
        <Box className={layoutCss.row}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={12}>
              <NameInput
                name={SetNameStepFields.name}
                label={errors?.[SetNameStepFields.name]?.message || 'Name'}
                placeholder={fallbackName}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <Tooltip
                      title="This name is stored locally and will never be shared with us or any third parties."
                      arrow
                      placement="top"
                    >
                      <InputAdornment position="end">
                        <SvgIcon component={InfoIcon} inheritViewBox />
                      </InputAdornment>
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} item>
              <Typography variant="h5" fontWeight={700} display="inline-flex" alignItems="center" gap={1} mt={2}>
                Select Networks
              </Typography>
              <Typography variant="body2" mb={2}>
                Choose which networks you want your account to be active on. You can add more networks later.{' '}
              </Typography>

              {/* <Box className={css.select} data-cy="create-safe-select-network"> */}
              {/* <NetworkSelector /> */}
              {/* </Box> */}
              <NetworkMultiSelector
                onChainsUpdate={(selectedChains) => {
                  setChains(selectedChains)
                }}
              />
            </Grid>
          </Grid>
          <Typography variant="body2" mt={2}>
            By continuing, you agree to our{' '}
            <Link href={AppRoutes.terms} passHref legacyBehavior>
              <MUILink>terms of use</MUILink>
            </Link>{' '}
            and{' '}
            <Link href={AppRoutes.privacy} passHref legacyBehavior>
              <MUILink>privacy policy</MUILink>
            </Link>
            .
          </Typography>

          {isWrongChain && <NetworkWarning />}
          <NoWalletConnectedWarning />
        </Box>
        <Divider />
        <Box className={layoutCss.row}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button data-testid="cancel-btn" variant="outlined" onClick={onCancel} size="small">
              Cancel
            </Button>
            <Button data-testid="next-btn" type="submit" variant="contained" size="stretched" disabled={isDisabled}>
              Next
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}

export default SetNameStep
