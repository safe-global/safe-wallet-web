import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import SafeLogo from '@/public/images/logo-no-text.svg'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import { isConfirmableBy, isMultisigExecutionInfo, isSignableBy } from '@/utils/transaction-guards'
import CloseIcon from '@mui/icons-material/Close'
import { Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import { useContext } from 'react'
import css from './styles.module.css'

const TxStatusWidget = ({
  step,
  txSummary,
  handleClose,
  isReplacement = false,
  isBatch = false,
  isMessage = false,
}: {
  step: number
  txSummary?: TransactionSummary
  handleClose: () => void
  isReplacement?: boolean
  isBatch?: boolean
  isMessage?: boolean
}) => {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const { nonceNeeded } = useContext(SafeTxContext)
  const { threshold } = safe

  const { executionInfo = undefined } = txSummary || {}
  const { confirmationsSubmitted = 0 } = isMultisigExecutionInfo(executionInfo) ? executionInfo : {}

  const canConfirm = txSummary ? isConfirmableBy(txSummary, wallet?.address || '') : safe.threshold === 1
  const canSign = txSummary ? isSignableBy(txSummary, wallet?.address || '') : true

  return (
    <Paper>
      <div data-sid="86447" className={css.header}>
        <Typography fontWeight="700" display="flex" alignItems="center" gap={1}>
          <SafeLogo width={16} height={16} className={css.logo} />
          {isMessage ? 'Message' : 'Transaction'} status
        </Typography>

        <IconButton className={css.close} aria-label="close" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </div>

      <Divider />

      <div data-sid="14578" className={css.content}>
        <List className={css.status}>
          <ListItem>
            <ListItemIcon>
              <CreatedIcon />
            </ListItemIcon>

            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {isReplacement ? 'Create replacement transaction' : isBatch ? 'Queue transactions' : 'Create'}
            </ListItemText>
          </ListItem>

          <ListItem className={classnames({ [css.incomplete]: !canConfirm && !isBatch })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>

            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>
              {isBatch ? (
                'Create batch'
              ) : !nonceNeeded ? (
                'Confirmed'
              ) : isMessage ? (
                'Collect signatures'
              ) : (
                <>
                  Confirmed ({confirmationsSubmitted} of {threshold})
                  {canSign && (
                    <Typography variant="body2" component="span" className={css.badge}>
                      +1
                    </Typography>
                  )}
                </>
              )}
            </ListItemText>
          </ListItem>

          <ListItem className={classnames({ [css.incomplete]: step < 2 })}>
            <ListItemIcon>
              <SignedIcon />
            </ListItemIcon>

            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>{isMessage ? 'Done' : 'Execute'}</ListItemText>
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
