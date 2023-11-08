import { Divider, CardActions, Button, Typography } from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import type { ReactElement } from 'react'

import TxCard from '../../common/TxCard'
import type { EnableRecoveryFlowProps } from '.'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export function EnableRecoveryFlowSettings({
  params,
  onSubmit,
}: {
  params: EnableRecoveryFlowProps
  onSubmit: (formData: EnableRecoveryFlowProps) => void
}): ReactElement {
  const formMethods = useForm<EnableRecoveryFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className={commonCss.form}>
          <TxCard>
            <Typography variant="h5">Trusted guardian</Typography>
            <Typography variant="body2">
              Choosen a guardian, such as a hardware wallet or family member&apos;s wallet, that can initiate the
              recovery process in the future.
            </Typography>

            {/* TODO: Address field */}

            {/* TODO: Info button */}
            <Typography variant="h5">Recovery delay</Typography>
            <Typography variant="body2">
              You can cancel any recovery attempt when it is not needed or wanted within the delay period.
            </Typography>

            {/* TODO: Delay field */}

            {/* TODO: Advanced options */}
          </TxCard>

          <TxCard>
            {/* TODO: Recommended badge */}

            <Typography variant="h5">Receive email updates</Typography>
            <Typography variant="body2">Get notified about any recovery initiations and their statuses.</Typography>

            {/* TODO: Email address field */}

            {/* TODO: Tenderly logo */}

            <Divider className={commonCss.nestedDivider} />

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
