import { Button, CardActions, Divider, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import TxCard from '../../common/TxCard'
import RecoveryRecoverers from '@/public/images/settings/spending-limit/beneficiary.svg'
import RecoveryRecoverer from '@/public/images/transactions/recovery-recoverer.svg'
import RecoveryDelay from '@/public/images/settings/spending-limit/time.svg'
import RecoveryExecution from '@/public/images/transactions/recovery-execution.svg'

import css from './styles.module.css'
import commonCss from '@/components/tx-flow/common/styles.module.css'

const RecoverySteps = [
  {
    Icon: RecoveryRecoverers,
    title: 'Choose a Recoverer and set a delay',
    subtitle:
      'Only your chosen Recoverer can initiate the recovery process. The process can be cancelled at any time during the delay period.',
  },
  {
    Icon: RecoveryRecoverer,
    title: 'Lost access? Let the Recoverer connect',
    subtitle: 'The recovery process can be initiated by a trusted Recoverer when connected to your Safe Account.',
  },
  {
    Icon: RecoveryDelay,
    title: 'Start the recovery process',
    subtitle: (
      <>
        Your <b>Recoverer</b> chooses new Safe Account owner(s) that you control and can initiates the recovery
        transaction.
      </>
    ),
  },
  {
    Icon: RecoveryExecution,
    title: 'All done! The Account is yours again',
    subtitle:
      'Once the delay period has passed, you can execute the recovery transaction and regain access to your Safe Account.',
  },
]

export function UpsertRecoveryFlowIntro({ onSubmit }: { onSubmit: () => void }): ReactElement {
  return (
    <TxCard>
      <Grid container display="flex" gap={4} className={css.connector}>
        {RecoverySteps.map(({ Icon, title, subtitle }, index) => (
          <Grid item xs={12} key={index}>
            <Grid container display="flex" gap={3}>
              <Grid item className={css.icon}>
                <Icon />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" mb={0.5}>
                  {title}
                </Typography>
                <Typography variant="body2">{subtitle}</Typography>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>

      <Divider className={commonCss.nestedDivider} />

      <CardActions sx={{ mt: 'var(--space-1) !important' }}>
        <Button variant="contained" onClick={onSubmit}>
          Next
        </Button>
      </CardActions>
    </TxCard>
  )
}
