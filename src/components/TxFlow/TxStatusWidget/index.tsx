import { Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import classnames from 'classnames'
import css from './styles.module.css'

const confirmedMessage = (threshold: number, confirmations: number) => {
  return (
    <>
      Confirmed ({confirmations} of {threshold})
    </>
  )
}

const TxStatusWidget = ({ step, txSummary }: { step: number; txSummary?: TransactionSummary }) => {
  const { safe } = useSafeInfo()
  const { threshold } = safe

  const { executionInfo = undefined } = txSummary || {}
  const { confirmationsSubmitted = 0 } = isMultisigExecutionInfo(executionInfo) ? executionInfo : {}

  const isConfirmedStepIncomplete = step < 1 && !confirmationsSubmitted

  return (
    <Paper>
      <div className={css.header}>
        <img src="/images/logo-no-text.svg" alt="Safe logo" width="32px" />
        <Typography variant="h6" fontWeight="700">
          Transaction status
        </Typography>
      </div>
      <Divider />
      <div className={css.content}>
        <List className={css.status}>
          <ListItem>
            <ListItemIcon>
              <CreatedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Created</ListItemText>
          </ListItem>
          <ListItem className={classnames({ [css.incomplete]: isConfirmedStepIncomplete })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {confirmedMessage(threshold, confirmationsSubmitted)}
            </ListItemText>
          </ListItem>
          <ListItem className={classnames({ [css.incomplete]: step < 2 })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Execute</ListItemText>
          </ListItem>
        </List>
      </div>
    </Paper>
  )
}

export default TxStatusWidget
