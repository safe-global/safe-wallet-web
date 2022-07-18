import { Grid, Box, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { TransactionStatus, type Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import SignTxButton from '@/components/transactions/SignTxButton'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { isAwaitingExecution, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import { useTransactionStatus } from '@/hooks/useTransactionStatus'
import TxType from '@/components/transactions/TxType'
import GroupIcon from '@mui/icons-material/Group'

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const dateOptions = {
  timeStyle: 'short',
  hour12: true,
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const tx = item.transaction
  const wallet = useWallet()
  const txStatusLabel = useTransactionStatus(tx)
  const isQueue = tx.txStatus !== TransactionStatus.SUCCESS
  const awaitingExecution = isAwaitingExecution(item.transaction.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : ''
  const submittedConfirmations = isMultisigExecutionInfo(tx.executionInfo)
    ? tx.executionInfo.confirmationsSubmitted
    : ''
  const requiredConfirmations = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.confirmationsRequired : ''

  return (
    <Grid container className={css.gridContainer} id={tx.id} gap={[2, undefined, undefined, 0]}>
      <Grid item xs={1}>
        {isGrouped ? null : nonce}
      </Grid>

      <Grid item md={2} lg={3}>
        <TxType tx={tx} />
      </Grid>

      <Grid item md={2} lg={3}>
        <TxInfo info={tx.txInfo} />
      </Grid>

      <Grid item lg={1} sx={{ whiteSpace: 'nowrap' }}>
        <DateTime value={tx.timestamp} options={dateOptions} />
      </Grid>

      {awaitingExecution && (
        <Grid item lg={2} display="flex" alignItems="center" justifyContent="center" gap={1}>
          <GroupIcon fontSize="small" color="border" />
          <Typography variant="caption" fontWeight="bold" color="primary">
            {submittedConfirmations} out of {requiredConfirmations}
          </Typography>
        </Grid>
      )}

      {wallet && isQueue && (
        <Grid item lg={1}>
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            {awaitingExecution ? (
              <ExecuteTxButton txSummary={item.transaction} />
            ) : (
              <SignTxButton txSummary={item.transaction} />
            )}
            <RejectTxButton txSummary={item.transaction} />
          </Box>
        </Grid>
      )}

      <Grid item marginLeft="auto" marginRight={2}>
        <Typography
          variant="caption"
          fontWeight="bold"
          color={({ palette }) => (awaitingExecution ? palette.warning.dark : palette.primary.main)}
        >
          {txStatusLabel}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default TxSummary
