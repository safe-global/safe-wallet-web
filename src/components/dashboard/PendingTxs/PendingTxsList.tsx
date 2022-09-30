import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'
import styled from '@emotion/styled'
import { Box, Skeleton, Typography } from '@mui/material'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
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
  const router = useRouter()
  const url = `${AppRoutes.transactions.queue}?safe=${router.query.safe}`

  const queuedTxns: Transaction[] = (page?.results || []).filter(isTransactionListItem)

  // Filter out duplicate nonce transactions
  const queuedTxsToDisplay = uniqBy(queuedTxns, (item) =>
    isMultisigExecutionInfo(item.transaction.executionInfo) ? item.transaction.executionInfo.nonce : '',
  ).slice(0, size)

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
