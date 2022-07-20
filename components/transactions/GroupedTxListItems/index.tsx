import { ReactElement } from 'react'
import { Box, Link, Paper, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { isConflictHeaderListItem, isTransactionListItem } from '@/utils/transaction-guards'
import { ExpandableTransactionItem } from '@/components/transactions/TxListItem'
import css from './styles.module.css'
import { TxHoverProvider } from '@/components/transactions/GroupedTxListItems/TxHoverProvider'

const Disclaimer = ({ nonce }: { nonce?: number }) => (
  <Box className={css.disclaimerContainer}>
    <Typography alignSelf="flex-start">{`${nonce}`}</Typography>
    <Typography>
      These transactions conflict as they use the same nonce. Executing one will automatically replace the other(s).
    </Typography>

    <Link
      href="https://help.gnosis-safe.io/en/articles/4730252-why-are-transactions-with-the-same-nonce-conflicting-with-each-other"
      target="_blank"
      rel="noreferrer"
      title="Why are transactions with the same nonce conflicting with each other?"
      className={css.link}
    >
      Learn more
      <OpenInNewRoundedIcon fontSize="small" />
    </Link>
  </Box>
)

const GroupedTxListItems = ({ groupedListItems }: { groupedListItems: TransactionListItem[] }): ReactElement => {
  const [conflictHeader, ...groupedTxs] = groupedListItems
  const nonce = isConflictHeaderListItem(conflictHeader) ? conflictHeader.nonce : undefined

  return (
    <Paper className={css.container} variant="outlined">
      <Disclaimer nonce={nonce} />
      <TxHoverProvider>
        {groupedTxs.map((tx) => {
          if (isTransactionListItem(tx)) {
            return <ExpandableTransactionItem key={tx.transaction.id} item={tx} isGrouped />
          }
        })}
      </TxHoverProvider>
    </Paper>
  )
}

export default GroupedTxListItems
