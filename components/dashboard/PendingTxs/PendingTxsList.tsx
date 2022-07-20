import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'
import styled from '@emotion/styled'
import { Box, Skeleton, Typography } from '@mui/material'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { Card, ViewAllLink, WidgetBody, WidgetContainer, WidgetTitle } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import { isTransactionListItem } from '@/utils/transaction-guards'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'

const SkeletonWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
`

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`

const StyledWidgetTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const EmptyState = (
  <Card>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 1,
        gap: 2,
      }}
    >
      <img alt="No Transactions yet" src="/images/no-transactions.svg" />
      <Typography fontSize="lg">This Safe has no queued transactions</Typography>
    </Box>
  </Card>
)

const PendingTxsList = ({ size = 5 }: { size?: number }): ReactElement | null => {
  const { page, loading } = useTxQueue()
  const router = useRouter()
  const url = `${AppRoutes.safe.transactions.queue}?safe=${router.query.safe}`
  const queuedTxsToDisplay: Transaction[] = uniqBy((page?.results || []).filter(isTransactionListItem), 'nonce')
  const totalQueuedTxs = queuedTxsToDisplay.length

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
    if (!queuedTxsToDisplay.length) return EmptyState
    return ResultState
  }

  return (
    <WidgetContainer>
      <StyledWidgetTitle>
        <WidgetTitle>Transaction queue {totalQueuedTxs ? ` (${totalQueuedTxs})` : ''}</WidgetTitle>
        <ViewAllLink url={url} />
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
