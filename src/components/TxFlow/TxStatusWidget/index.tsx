import { Divider, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import css from './styles.module.css'
import { type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import classnames from 'classnames'

const confirmedMessage = (threshold: number, confirmations?: number) => {
  const confirmationCount = confirmations ?? 0

  return (
    <>
      Confirmed ({confirmationCount} of {threshold})
    </>
  )
}

const TxStatusWidget = ({ step, txDetails }: { step: number; txDetails?: TransactionDetails }) => {
  const { safe } = useSafeInfo()
  const { threshold } = safe

  const { detailedExecutionInfo = undefined } = txDetails || {}
  const { confirmations = [] } = isMultisigDetailedExecutionInfo(detailedExecutionInfo) ? detailedExecutionInfo : {}

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
          <ListItem className={classnames({ [css.incomplete]: step < 1 })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {confirmedMessage(threshold, confirmations.length)}
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
