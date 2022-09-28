import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import { groupConflictingTxs } from '@/utils/tx-list'
import styled from '@emotion/styled'
import { Skeleton, Typography } from '@mui/material'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import { isTransactionListItem } from '@/utils/transaction-guards'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoTransactionsIcon from '@/public/images/no-transactions.svg'
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
      <PagePlaceholder img={<NoTransactionsIcon />} text="This Safe has no queued transactions" />
    </Card>
  )
}

const PendingTxsList = ({ size = 4 }: { size?: number }): ReactElement | null => {
  const { page, loading } = useTxQueue()
  const router = useRouter()
  const url = `${AppRoutes.transactions.queue}?safe=${router.query.safe}`

  const queuedTxns = useMemo(() => {
    return (
      groupConflictingTxs(page?.results || [])
        // Get latest transaction if there are conflicting ones
        .map((group) => (Array.isArray(group) ? group[0] : group))
        .filter(isTransactionListItem)
    )
  }, [page?.results])

  const queuedTxsToDisplay = queuedTxns.slice(0, size)

  const totalQueuedTxs = getQueuedTransactionCount(page)

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
          <PendingTxListItem transaction={transaction.transaction} url={url} key={transaction.transaction.id} />
        ))}
      </StyledList>
    ),
    [queuedTxsToDisplay, url],
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
        {queuedTxns.length > 0 && <ViewAllLink url={url} />}
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
