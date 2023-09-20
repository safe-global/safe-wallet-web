import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { getLatestTransactions } from '@/utils/tx-list'
import { Box, Skeleton, Typography } from '@mui/material'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'
import NoTransactionsIcon from '@/public/images/transactions/no-transactions.svg'
import css from './styles.module.css'
import { isSignableBy, isExecutable } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'

const MAX_TXS = 4

const EmptyState = () => {
  return (
    <Card>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
        <NoTransactionsIcon />

        <Typography variant="body1" color="primary.light">
          This Safe Account has no queued transactions
        </Typography>
      </Box>
    </Card>
  )
}

const LoadingState = () => (
  <div className={css.list}>
    {Array.from(Array(MAX_TXS).keys()).map((key) => (
      <Skeleton key={key} variant="rectangular" height={52} />
    ))}
  </div>
)

const PendingTxsList = (): ReactElement | null => {
  const router = useRouter()
  const { page, loading } = useTxQueue()
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const queuedTxns = useMemo(() => getLatestTransactions(page?.results), [page?.results])

  const actionableTxs = useMemo(() => {
    return wallet
      ? queuedTxns.filter(
          (tx) => isSignableBy(tx.transaction, wallet.address) || isExecutable(tx.transaction, wallet.address, safe),
        )
      : queuedTxns
  }, [wallet, queuedTxns, safe])

  const txs = actionableTxs.length ? actionableTxs : queuedTxns
  const txsToDisplay = txs.slice(0, MAX_TXS)

  const queueUrl = useMemo(
    () => ({
      pathname: AppRoutes.transactions.queue,
      query: { safe: router.query.safe },
    }),
    [router.query.safe],
  )

  return (
    <WidgetContainer>
      <div className={css.title}>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Pending transactions
        </Typography>

        {queuedTxns.length > 0 && <ViewAllLink url={queueUrl} />}
      </div>

      <WidgetBody>
        {loading ? (
          <LoadingState />
        ) : queuedTxns.length ? (
          <div className={css.list}>
            {txsToDisplay.map((tx) => (
              <PendingTxListItem transaction={tx.transaction} key={tx.transaction.id} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
