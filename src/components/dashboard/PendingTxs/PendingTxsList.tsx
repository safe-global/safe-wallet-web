import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { getLatestTransactions } from '@/utils/tx-list'
import styled from '@emotion/styled'
import { Box, Skeleton, Typography } from '@mui/material'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'
import NoTransactionsIcon from '@/public/images/transactions/no-transactions.svg'
import { getQueuedTransactionCount } from '@/utils/transactions'

const SkeletonWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
`

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
`

const StyledWidgetTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const EmptyState = () => {
  return (
    <Card>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2}>
        <NoTransactionsIcon />

        <Typography variant="body1" color="primary.light">
          This Safe has no queued transactions
        </Typography>
      </Box>
    </Card>
  )
}

const PendingTxsList = ({ size = 4 }: { size?: number }): ReactElement | null => {
  const { page, loading } = useTxQueue()
  const queuedTxns = useMemo(() => getLatestTransactions(page?.results), [page?.results])
  const queuedTxsToDisplay = queuedTxns.slice(0, size)
  const totalQueuedTxs = getQueuedTransactionCount(page)
  const router = useRouter()

  const queueUrl = useMemo(
    () => ({
      pathname: AppRoutes.transactions.queue,
      query: { safe: router.query.safe },
    }),
    [router],
  )

  const LoadingState = useMemo(
    () => (
      <StyledList>
        {Array.from(Array(size).keys()).map((key) => (
          <SkeletonWrapper key={key}>
            <Skeleton variant="rectangular" height={52} />
          </SkeletonWrapper>
        ))}
      </StyledList>
    ),
    [size],
  )

  const ResultState = useMemo(
    () => (
      <StyledList>
        {queuedTxsToDisplay.map((transaction) => (
          <PendingTxListItem transaction={transaction.transaction} key={transaction.transaction.id} />
        ))}
      </StyledList>
    ),
    [queuedTxsToDisplay],
  )

  const getWidgetBody = () => {
    if (loading) return LoadingState
    if (!queuedTxsToDisplay.length) return <EmptyState />
    return ResultState
  }

  return (
    <WidgetContainer>
      <StyledWidgetTitle>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Transaction queue {totalQueuedTxs ? ` (${totalQueuedTxs})` : ''}
        </Typography>
        {queuedTxns.length > 0 && <ViewAllLink url={queueUrl} />}
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
