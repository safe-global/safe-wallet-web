import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import uniqBy from 'lodash/uniqBy'
import styled from '@emotion/styled'
import { Skeleton, Typography } from '@mui/material'
import { Transaction, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import PendingTxListItem from './PendingTxListItem'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useTxQueue from '@/hooks/useTxQueue'
import { AppRoutes } from '@/config/routes'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import useWallet from '@/hooks/wallets/useWallet'

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

const StyledEmptyCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
  padding: var(--space-4);

  img {
    width: 144px;
    height: auto;
  }

  h3 {
    font-size: 16px;
    margin-bottom: 0;
  }
`

const EmptyState = (
  <StyledEmptyCard>
    <PagePlaceholder imageUrl="/images/no-transactions.svg" text="This Safe has no actionable, queued transactions" />
  </StyledEmptyCard>
)

const PendingTxsList = ({ size = 4 }: { size?: number }): ReactElement => {
  const { page, loading } = useTxQueue()
  const router = useRouter()
  const wallet = useWallet()
  const url = `${AppRoutes.safe.transactions.queue}?safe=${router.query.safe}`

  const queuedTxns: Transaction[] = (page?.results || []).filter(isTransactionListItem)

  // Filter out duplicate nonce transactions
  const queuedTxsToDisplay = uniqBy(queuedTxns, (item) => {
    isMultisigExecutionInfo(item.transaction.executionInfo) ? item.transaction.executionInfo.nonce : ''
  })
    .filter(({ transaction }) => {
      return isMultisigExecutionInfo(transaction.executionInfo) &&
        transaction.txStatus === TransactionStatus.AWAITING_CONFIRMATIONS
        ? transaction.executionInfo?.missingSigners?.some(({ value }) => value === wallet?.address)
        : true
    })
    .slice(0, size)

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
    if (!queuedTxsToDisplay.length) return EmptyState
    return ResultState
  }

  return (
    <WidgetContainer>
      <StyledWidgetTitle>
        <Typography variant="h2" mb={2}>
          Transaction queue {totalQueuedTxs ? ` (${totalQueuedTxs})` : ''}
        </Typography>
        {totalQueuedTxs > 0 && <ViewAllLink url={url} />}
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default PendingTxsList
