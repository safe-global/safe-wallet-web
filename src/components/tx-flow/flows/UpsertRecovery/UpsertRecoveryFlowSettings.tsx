import {
  Divider,
  CardActions,
  Button,
  Typography,
  SvgIcon,
  MenuItem,
  TextField,
  Collapse,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { forwardRef, useState } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

import TxCard from '../../common/TxCard'
import { UpsertRecoveryFlowFields } from '.'
import { useRecoveryPeriods } from './useRecoveryPeriods'
import AddressBookInput from '@/components/common/AddressBookInput'
import CircleCheckIcon from '@/public/images/common/circle-check.svg'
import { useDarkMode } from '@/hooks/useDarkMode'
import { sameAddress } from '@/utils/addresses'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'
import type { UpsertRecoveryFlowProps } from '.'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import css from './styles.module.css'

export function UpsertRecoveryFlowSettings({
  params,
  onSubmit,
}: {
  params: UpsertRecoveryFlowProps
  onSubmit: (formData: UpsertRecoveryFlowProps) => void
}): ReactElement {
  const { safeAddress } = useSafeInfo()
  const [showAdvanced, setShowAdvanced] = useState(params[UpsertRecoveryFlowFields.txExpiration] !== '0')
  const [understandsRisk, setUnderstandsRisk] = useState(false)
  const isDarkMode = useDarkMode()
  const periods = useRecoveryPeriods()

  const formMethods = useForm<UpsertRecoveryFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  const validateGuardian = (guardian: string) => {
    if (sameAddress(guardian, safeAddress)) {
      return 'The Safe Account cannot be a Guardian of itself'
    }
  }

  const emailAddress = formMethods.watch(UpsertRecoveryFlowFields.emailAddress)

  const onShowAdvanced = () => setShowAdvanced((prev) => !prev)

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className={commonCss.form}>
          <TxCard>
            <div>
              <Typography variant="h5" gutterBottom>
                Trusted Guardian
              </Typography>

              <Typography variant="body2">
                Choose a Guardian, such as a hardware wallet or family member&apos;s wallet, that can initiate the
                recovery process in the future.
              </Typography>
            </div>

            <AddressBookInput
              label="Guardian address"
              name={UpsertRecoveryFlowFields.guardian}
              required
              fullWidth
              validate={validateGuardian}
            />

            <div>
              <Typography variant="h5" gutterBottom>
                Recovery delay
                <Tooltip
                  placement="top"
                  arrow
                  title="The recovery delay begins after the recovery attempt is initiated"
                >
                  <span>
                    <SvgIcon
                      component={InfoIcon}
                      inheritViewBox
                      fontSize="small"
                      color="border"
                      sx={{ verticalAlign: 'middle', ml: 0.5 }}
                    />
                  </span>
                </Tooltip>
              </Typography>

              <Typography variant="body2">
                You can cancel any recovery attempt when it is not needed or wanted within the delay period.
              </Typography>
            </div>

            <Controller
              control={formMethods.control}
              name={UpsertRecoveryFlowFields.txCooldown}
              render={({ field }) => (
                <SelectField label="Recovery delay" fullWidth {...field}>
                  {periods.delay.map(({ label, value }, index) => (
                    <MenuItem key={index} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </SelectField>
              )}
            />

            <Typography variant="body2" onClick={onShowAdvanced} role="button" className={css.advanced}>
              Advanced {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Typography>

            <Collapse in={showAdvanced}>
              <Typography variant="body2" mb={2}>
                Set a period of time after which the recovery attempt will expire and can no longer be executed.
              </Typography>

              <Controller
                control={formMethods.control}
                name={UpsertRecoveryFlowFields.txExpiration}
                // Don't reset value if advanced section is collapsed
                shouldUnregister={false}
                render={({ field }) => (
                  <SelectField label="Transaction expiry" fullWidth {...field}>
                    {periods.expiration.map(({ label, value }, index) => (
                      <MenuItem key={index} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </SelectField>
                )}
              />
            </Collapse>
          </TxCard>

          <TxCard>
            <div className={css.recommended}>
              <SvgIcon component={CircleCheckIcon} inheritViewBox color="info" fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="caption">Recommended</Typography>
            </div>

            <div>
              <Typography variant="h5" gutterBottom>
                Receive email updates
              </Typography>

              <Typography variant="body2" mb={1}>
                Get notified about any recovery initiations and their statuses.
              </Typography>
            </div>

            <Controller
              control={formMethods.control}
              name={UpsertRecoveryFlowFields.emailAddress}
              render={({ field }) => (
                <TextField
                  label="Enter email address"
                  fullWidth
                  {...field}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />

            {emailAddress ? (
              <div className={css.poweredBy}>
                <Typography variant="caption">Powered by </Typography>
                <img
                  src={
                    isDarkMode ? '/images/transactions/tenderly-light.svg' : '/images/transactions/tenderly-dark.svg'
                  }
                  alt="Tenderly"
                  className={css.tenderly}
                />
              </div>
            ) : (
              <FormControlLabel
                label="I understand the risks of proceediung without an email address"
                control={<Checkbox checked={understandsRisk} onChange={(_, checked) => setUnderstandsRisk(checked)} />}
                sx={{ pl: 2 }}
              />
            )}

            <Divider className={commonCss.nestedDivider} />

            <CardActions sx={{ mt: '0 !important' }}>
              <Button variant="contained" type="submit" disabled={!emailAddress && !understandsRisk}>
                Next
              </Button>
            </CardActions>
          </TxCard>
        </form>
      </FormProvider>
    </>
  )
}

const SelectField = forwardRef<TextFieldProps['ref'], TextFieldProps>((props, ref) => {
  return (
    <TextField
      {...props}
      ref={ref}
      select
      sx={{
        '& .MuiSelect-select': {
          textAlign: 'right',
          fontWeight: 700,
          fontSize: '14px',
        },
      }}
      InputLabelProps={{
        shrink: false,
        sx: {
          color: 'text.primary',
          fontSize: '14px',
        },
      }}
    />
  )
})
SelectField.displayName = 'SelectField'
