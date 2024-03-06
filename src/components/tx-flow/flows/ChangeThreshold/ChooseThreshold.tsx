import {
  Box,
  Button,
  CardActions,
  Divider,
  Grid,
  MenuItem,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactElement } from 'react'
import { Controller, useForm } from 'react-hook-form'

import TxCard from '@/components/tx-flow/common/TxCard'
import { TOOLTIP_TITLES } from '@/components/tx-flow/common/constants'
import type { ChangeThresholdFlowProps } from '@/components/tx-flow/flows/ChangeThreshold'
import { ChangeThresholdFlowFieldNames } from '@/components/tx-flow/flows/ChangeThreshold'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@/public/images/notifications/info.svg'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export const ChooseThreshold = ({
  params,
  onSubmit,
}: {
  params: ChangeThresholdFlowProps
  onSubmit: (data: ChangeThresholdFlowProps) => void
}): ReactElement => {
  const { safe } = useSafeInfo()

  const formMethods = useForm<ChangeThresholdFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  const newThreshold = formMethods.watch(ChangeThresholdFlowFieldNames.threshold)

  return (
    <TxCard>
      <div>
        <Typography variant="h3" fontWeight={700}>
          Threshold
          <Tooltip title={TOOLTIP_TITLES.THRESHOLD} arrow placement="top">
            <span>
              <SvgIcon
                component={InfoIcon}
                inheritViewBox
                color="border"
                fontSize="small"
                sx={{
                  verticalAlign: 'middle',
                  ml: 0.5,
                }}
              />
            </span>
          </Tooltip>
        </Typography>

        <Typography>Any transaction will require the confirmation of:</Typography>
      </div>

      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Box data-sid="46696" mb={2}>
          <Controller
            control={formMethods.control}
            rules={{
              validate: (value) => {
                if (value === safe.threshold) {
                  return `Current policy is already set to ${safe.threshold}.`
                }
              },
            }}
            name={ChangeThresholdFlowFieldNames.threshold}
            render={({ field, fieldState }) => {
              const isError = !!fieldState.error

              return (
                <Grid container direction="row" gap={2} alignItems="center">
                  <Grid item>
                    <TextField select {...field} error={isError}>
                      {safe.owners.map((_, idx) => (
                        <MenuItem key={idx + 1} value={idx + 1}>
                          {idx + 1}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item>
                    <Typography>out of {safe.owners.length} owner(s)</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    {isError ? (
                      <Typography color="error" mb={2}>
                        {fieldState.error?.message}
                      </Typography>
                    ) : (
                      <Typography mb={2}>
                        {fieldState.isDirty ? 'Previous policy was ' : 'Current policy is '}
                        <b>
                          {safe.threshold} out of {safe.owners.length}
                        </b>
                        .
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )
            }}
          />
        </Box>

        <Divider className={commonCss.nestedDivider} />

        <CardActions>
          <Button
            data-sid="67959"
            variant="contained"
            type="submit"
            disabled={
              !!formMethods.formState.errors[ChangeThresholdFlowFieldNames.threshold] ||
              // Prevent initial submit before field was interacted with
              newThreshold === safe.threshold
            }
          >
            Next
          </Button>
        </CardActions>
      </form>
    </TxCard>
  )
}
