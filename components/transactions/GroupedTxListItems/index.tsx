import { ReactElement } from 'react'
import { Box, Link, Paper, Typography } from '@mui/material'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { ExpandableTransactionItem } from '@/components/transactions/TxListItem'
import css from './styles.module.css'
import { useGroupedItems } from '@/components/transactions/GroupedTxListItems/useGroupedItems'

const Disclaimer = ({ nonce }: { nonce?: number }) => (
  <Box className={css.disclaimerContainer}>
    <Typography alignSelf="flex-start">{nonce}</Typography>
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

const GroupedTxListItems = ({ groupedListItems }: { groupedListItems: Transaction[] }): ReactElement => {
  const nonce = isMultisigExecutionInfo(groupedListItems[0].transaction.executionInfo)
    ? groupedListItems[0].transaction.executionInfo.nonce
    : undefined

  const items = useGroupedItems(groupedListItems)

  return (
    <Paper className={css.container} variant="outlined">
      <Disclaimer nonce={nonce} />
      {items.map((tx) => (
        <ExpandableTransactionItem key={tx.transaction.id} item={tx} isGrouped />
      ))}
    </Paper>
  )
}

export default GroupedTxListItems
