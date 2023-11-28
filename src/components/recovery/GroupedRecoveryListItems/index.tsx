import { Box, Paper, Typography } from '@mui/material'
import { partition } from 'lodash'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'

import { isRecoveryQueueItem } from '@/utils/transaction-guards'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { RecoveryListItem } from '../RecoveryListItem'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'

import css from '@/components/transactions/GroupedTxListItems/styles.module.css'

function Disclaimer({ isMalicious }: { isMalicious: boolean }): ReactElement {
  return (
    <Box
      className={css.disclaimerContainer}
      sx={{ bgcolor: ({ palette }) => `${palette.warning.background} !important` }}
    >
      <Typography>
        <Typography component="span" fontWeight={700}>
          Cancelling {isMalicious ? 'malicious transaction' : 'Account recovery'}.
        </Typography>{' '}
        You will need to execute the cancellation.{' '}
        <ExternalLink href={HelpCenterArticle.RECOVERY} title="Learn more about the Account recovery process">
          Learn more
        </ExternalLink>
      </Typography>
    </Box>
  )
}

export function GroupedRecoveryListItems({ items }: { items: Array<Transaction | RecoveryQueueItem> }): ReactElement {
  const [recoveries, cancellations] = partition(items, isRecoveryQueueItem)

  // Should only be one recovery item but check array in case
  const isMalicious = recoveries.some((recovery) => recovery.isMalicious)

  return (
    <Paper className={css.container} variant="outlined" sx={{ borderColor: ({ palette }) => palette.warning.light }}>
      <Disclaimer isMalicious={isMalicious} />

      {cancellations.map((tx) => (
        <ExpandableTransactionItem key={tx.transaction.id} item={tx} />
      ))}

      {recoveries.map((recovery) => (
        <RecoveryListItem key={recovery.transactionHash} item={recovery} />
      ))}
    </Paper>
  )
}
