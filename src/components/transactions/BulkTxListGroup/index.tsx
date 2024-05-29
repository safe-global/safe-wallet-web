import type { ReactElement } from 'react'
import { Box, Grid, Paper, SvgIcon, Typography } from '@mui/material'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import BatchIcon from '@/public/images/common/batch.svg'
import css from './styles.module.css'
import { generateDataRowValue } from '../TxDetails/Summary/TxDataRow'

const GroupedTxListItems = ({
  groupedListItems,
  transactionHash,
}: {
  groupedListItems: Transaction[]
  transactionHash: string
}): ReactElement | null => {
  if (groupedListItems.length === 0) return null

  return (
    <Paper className={css.container}>
      <Grid container gap={1}>
        <Grid item xs={1} sm={0.5} display="flex" alignItems="center">
          <SvgIcon className={css.icon} component={BatchIcon} inheritViewBox fontSize="medium" />
        </Grid>
        <Grid item xs md={6} lg={3} mr={3} alignContent="center">
          <Typography noWrap>Transactions executed in bulk</Typography>
        </Grid>

        <Grid item xs>
          {generateDataRowValue(transactionHash, 'hash', true)}
        </Grid>

        <Box className={css.txItems}>
          {groupedListItems.map((tx) => {
            const nonce = isMultisigExecutionInfo(tx.transaction.executionInfo)
              ? tx.transaction.executionInfo.nonce
              : ''
            return (
              <Box display="flex" key={tx.transaction.id}>
                <Grid item xs={1} sm={0.5} mt={2} mr={1}>
                  <Typography className={css.nonce}>{nonce}</Typography>
                </Grid>

                <Grid item xs={11} sm={11.5}>
                  <ExpandableTransactionItem item={tx} isBulkGroup={true} />
                </Grid>
              </Box>
            )
          })}
        </Box>
      </Grid>
    </Paper>
  )
}

export default GroupedTxListItems
