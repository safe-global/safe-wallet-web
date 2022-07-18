import { ReactElement } from 'react'
import { Box, Link, Paper, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { isConflictHeaderListItem, isTransactionListItem } from '@/utils/transaction-guards'
import { ExpandableTransactionItem } from '@/components/transactions/TxListItem'
import css from './styles.module.css'

const Disclaimer = ({ nonce }: { nonce?: number }) => (
  <Box className={css.disclaimerContainer}>
    <Typography alignSelf="flex-start">{`${nonce}`}</Typography>
    <Box className={css.alignItemsWithMargin}>
      <Typography>
        These transactions conflict as they use the same nonce. Executing one will automatically replace the other(s).{' '}
      </Typography>
    </Box>

    <Link
      href="https://help.gnosis-safe.io/en/articles/4730252-why-are-transactions-with-the-same-nonce-conflicting-with-each-other"
      target="_blank"
      rel="noreferrer"
      title="Why are transactions with the same nonce conflicting with each other?"
    >
      <Box className={css.alignItemsWithMargin}>
        Learn more
        <OpenInNewRoundedIcon fontSize="small" />
      </Box>
    </Link>
  </Box>
)

const GroupedTxListItems = ({ groupedListItems }: { groupedListItems: TransactionListItem[] }): ReactElement => {
  const [conflictHeader, ...groupedTxs] = groupedListItems
  const nonce = isConflictHeaderListItem(conflictHeader) ? conflictHeader.nonce : undefined

  return (
    <Paper className={css.container} variant="outlined">
      <Disclaimer nonce={nonce} />
      {groupedTxs.map((tx) => {
        if (isTransactionListItem(tx)) {
          return <ExpandableTransactionItem item={tx} isGrouped />
        }
      })}
    </Paper>
  )
}

export default GroupedTxListItems
