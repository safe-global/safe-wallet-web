import { Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo, isSignableBy } from '@/utils/transaction-guards'
import classnames from 'classnames'
import css from './styles.module.css'
import CloseIcon from '@mui/icons-material/Close'
import useWallet from '@/hooks/wallets/useWallet'
import { useDarkMode } from '@/hooks/useDarkMode'

const confirmedMessage = (threshold: number, confirmations: number) => {
  return (
    <>
      Confirmed ({confirmations} of {threshold})
    </>
  )
}

const TxStatusWidget = ({
  step,
  txSummary,
  handleClose,
  isReplacement = false,
}: {
  step: number
  txSummary?: TransactionSummary
  handleClose: () => void
  isReplacement?: boolean
}) => {
  const isDarkMode = useDarkMode()
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const { threshold } = safe

  const { executionInfo = undefined } = txSummary || {}
  const { confirmationsSubmitted = 0 } = isMultisigExecutionInfo(executionInfo) ? executionInfo : {}

  const isConfirmedStepIncomplete = step < 1 && !confirmationsSubmitted
  const canSign = txSummary ? isSignableBy(txSummary, wallet?.address || '') : true

  return (
    <Paper>
      <div className={css.header}>
        <img src="/images/logo-no-text.svg" alt="Safe logo" className={css.logo} />
        <Typography variant="h6" fontWeight="700" className={css.title}>
          Transaction status
        </Typography>
        <IconButton className={css.close} aria-label="close" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>

      <Divider />

      <div className={css.content}>
        <List className={css.status}>
          <ListItem>
            <ListItemIcon>
              <CreatedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {isReplacement ? 'Create replacement transaction' : 'Create'}
            </ListItemText>
          </ListItem>

          <ListItem className={classnames({ [css.incomplete]: isConfirmedStepIncomplete })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {confirmedMessage(threshold, confirmationsSubmitted)}
              {canSign && (
                <Typography
                  variant="body2"
                  component="span"
                  className={css.badge}
                  sx={({ palette }) => ({
                    bgcolor: isDarkMode ? `${palette.primary.main}` : `${palette.secondary.main}`,
                    color: isDarkMode ? `${palette.text.secondary}` : `${palette.text.primary}`,
                  })}
                >
                  +1
                </Typography>
              )}
            </ListItemText>
          </ListItem>

          <ListItem className={classnames({ [css.incomplete]: step < 2 })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Execute</ListItemText>
          </ListItem>

          {isReplacement && (
            <ListItem className={css.incomplete}>
              <ListItemIcon>
                <SignedIcon />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Transaction is replaced</ListItemText>
            </ListItem>
          )}
        </List>
      </div>
    </Paper>
  )
}

export default TxStatusWidget
