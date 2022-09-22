import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'
import styled from '@emotion/styled'
import { Skeleton, Typography } from '@mui/material'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoTransactionsIcon from '@/public/images/no-transactions.svg'

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

  const queuedTxns: Transaction[] = (page?.results || []).filter(isTransactionListItem)

  // Filter out duplicate nonce transactions
  const queuedTxsToDisplay = uniqBy(queuedTxns, (item) =>
    isMultisigExecutionInfo(item.transaction.executionInfo) ? item.transaction.executionInfo.nonce : '',
  ).slice(0, size)

  const totalQueuedTxs = queuedTxns.length

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
        {totalQueuedTxs > 0 && <ViewAllLink url={url} />}
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
