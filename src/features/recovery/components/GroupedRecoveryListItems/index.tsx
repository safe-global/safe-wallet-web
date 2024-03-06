import Track from '@/components/common/Track'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Box, Paper, Typography } from '@mui/material'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import partition from 'lodash/partition'
import type { ReactElement } from 'react'

import ExternalLink from '@/components/common/ExternalLink'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { HelpCenterArticle, HelperCenterArticleTitles } from '@/config/constants'
import { isRecoveryQueueItem } from '@/utils/transaction-guards'
import { RecoveryListItem } from '../RecoveryListItem'

import css from '@/components/transactions/GroupedTxListItems/styles.module.css'
import customCss from './styles.module.css'

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
        <Track {...RECOVERY_EVENTS.LEARN_MORE} label="tx-queue">
          <ExternalLink href={HelpCenterArticle.RECOVERY} title={HelperCenterArticleTitles.RECOVERY}>
            Learn more
          </ExternalLink>
        </Track>
      </Typography>
    </Box>
  )
}

export function GroupedRecoveryListItems({ items }: { items: Array<Transaction | RecoveryQueueItem> }): ReactElement {
  const [recoveries, cancellations] = partition(items, isRecoveryQueueItem)

  // Should only be one recovery item but check array in case
  const isMalicious = recoveries.some((recovery) => recovery.isMalicious)

  return (
    <Paper className={[css.container, customCss.recoveryGroupContainer].join(' ')}>
      <Box data-sid="59060" gridArea="warning" className={css.disclaimerContainer}>
        <Disclaimer isMalicious={isMalicious} />
      </Box>

      <Box data-sid="35990" gridArea="line" className={css.line} />

      <Box data-sid="57048" gridArea="items" className={css.txItems}>
        {cancellations.map((tx) => (
          <div data-sid="12717" key={tx.transaction.id}>
            <ExpandableTransactionItem item={tx} />
          </div>
        ))}

        {recoveries.map((recovery) => (
          <RecoveryListItem key={recovery.transactionHash} item={recovery} />
        ))}
      </Box>
    </Paper>
  )
}
