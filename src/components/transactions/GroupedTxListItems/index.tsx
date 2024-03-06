import ExternalLink from '@/components/common/ExternalLink'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { HelpCenterArticle } from '@/config/constants'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { Box, Paper, Typography } from '@mui/material'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { useContext } from 'react'
import { ReplaceTxHoverContext, ReplaceTxHoverProvider } from './ReplaceTxHoverProvider'
import css from './styles.module.css'

const Disclaimer = () => (
  <Typography>
    <b>Conflicting transactions</b>. Executing one will automatically replace the others.{' '}
    <ExternalLink
      href={HelpCenterArticle.CONFLICTING_TRANSACTIONS}
      title="Why are transactions with the same nonce conflicting with each other?"
      noIcon
    >
      Why did this happen?
    </ExternalLink>
  </Typography>
)

const TxGroup = ({ groupedListItems }: { groupedListItems: Transaction[] }): ReactElement => {
  const nonce = isMultisigExecutionInfo(groupedListItems[0].transaction.executionInfo)
    ? groupedListItems[0].transaction.executionInfo.nonce
    : undefined

  const { replacedTxIds } = useContext(ReplaceTxHoverContext)

  return (
    <Paper className={css.container}>
      <Typography gridArea="nonce">{nonce}</Typography>

      <Box data-sid="12824" gridArea="warning" className={css.disclaimerContainer}>
        <Disclaimer />
      </Box>

      <Box data-sid="59917" gridArea="line" className={css.line} />

      <Box data-sid="78300" gridArea="items" className={css.txItems}>
        {groupedListItems.map((tx) => (
          <div
            key={tx.transaction.id}
            className={replacedTxIds.includes(tx.transaction.id) ? css.willBeReplaced : undefined}
          >
            <ExpandableTransactionItem item={tx} isGrouped />
          </div>
        ))}
      </Box>
    </Paper>
  )
}

const GroupedTxListItems = ({ groupedListItems }: { groupedListItems: Transaction[] }): ReactElement | null => {
  if (groupedListItems.length === 0) return null

  return (
    <ReplaceTxHoverProvider groupedListItems={groupedListItems}>
      <TxGroup groupedListItems={groupedListItems} />
    </ReplaceTxHoverProvider>
  )
}

export default GroupedTxListItems
