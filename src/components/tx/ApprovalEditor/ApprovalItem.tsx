import { type ReactElement } from 'react'
import { Alert, Grid, Typography } from '@mui/material'
import css from '@/components/tx/ApprovalEditor/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { Approval } from '@/services/security/modules/ApprovalModule'

const approvalMethodDescription: Record<Approval['method'], string> = {
  approve: 'Set allowance to',
  increaseAllowance: 'Increase allowance by',
}

const ApprovalItem = ({
  spender,
  method,
  children,
}: {
  spender: string
  method: Approval['method']
  children: ReactElement
}) => {
  return (
    <Alert icon={false} variant="outlined" severity="warning" className={css.alert}>
      <Grid container gap={1} justifyContent="space-between">
        <Grid item xs={12}>
          <Typography variant="caption">{approvalMethodDescription[method]}</Typography>
        </Grid>
        <Grid item display="flex" xs={12} flexDirection="row" alignItems="center" gap={1}>
          {children}
        </Grid>

        <Grid item container display="flex" xs={12} alignItems="center" gap={1}>
          <Grid item xs={2}>
            <Typography color="text.secondary" variant="body2">
              Spender
            </Typography>
          </Grid>

          <Grid item>
            <Typography fontSize="14px">
              <EthHashInfo address={spender} hasExplorer showAvatar={false} shortAddress={false} />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Alert>
  )
}

export default ApprovalItem
