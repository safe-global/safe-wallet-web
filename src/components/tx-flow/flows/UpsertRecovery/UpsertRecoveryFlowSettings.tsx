import { CardActions, Button, Typography, SvgIcon, MenuItem, TextField, Collapse, Tooltip } from '@mui/material'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { useState } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

import TxCard from '../../common/TxCard'
import { UpsertRecoveryFlowFields } from '.'
import { useRecoveryPeriods } from './useRecoveryPeriods'
import AddressBookInput from '@/components/common/AddressBookInput'
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
              render={({ field: { ref, ...field } }) => (
                <SelectField label="Recovery delay" fullWidth inputRef={ref} {...field}>
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
                render={({ field: { ref, ...field } }) => (
                  <SelectField label="Transaction expiry" fullWidth inputRef={ref} {...field}>
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
            <CardActions sx={{ mt: '0 !important' }}>
              <Button variant="contained" type="submit">
                Next
              </Button>
            </CardActions>
          </TxCard>
        </form>
      </FormProvider>
    </>
  )
}

function SelectField(props: TextFieldProps) {
  return (
    <TextField
      {...props}
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
}
