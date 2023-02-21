import type { ReactElement } from 'react'
import { useState } from 'react'
import { useMemo } from 'react'
import styled from '@emotion/styled'
import { Box, Button, Skeleton, Typography } from '@mui/material'
import { Card, ViewAllLink, WidgetBody, WidgetContainer } from '../styled'
import StreamListItem from './StreamListItem'
import NoTransactionsIcon from '@/public/images/transactions/no-transactions.svg'
import useStreamsAndHistory from '@/hooks/queries/useStreamsAndHistory'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useCurrentChain } from '@/hooks/useChains'
import { useRouter } from 'next/router'
import NewStreamModal from '@/components/tx/modals/NewStreamModal'
import { useSafeUsers } from '@/hooks/useSafeUsers'

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
          This Safe has no streams
        </Typography>
      </Box>
    </Card>
  )
}

const StreamsList = ({ size = 4 }: { size?: number }): ReactElement | null => {
  //https://gnosis-safe.llamapay.io/salaries/withdraw/Polygon/0xbec9f9143028c4b5dae4867215b40ad261beeee1723efd9a946c8d9d99ae1668
  const [modalOpen, setModalOpen] = useState(false)
  const address = useSafeAddress()
  const router = useRouter()
  const { data: streams, isLoading: loading } = useStreamsAndHistory(address)
  const chain = useCurrentChain()
  const users = useSafeUsers(address)

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
        {streams.map((stream) => {
          const username = users.find((user) => user.address.toString() == stream.payeeAddress.toString())?.name
          const url = `https://app.safe.global/${router.query.safe}/apps?appUrl=https%3A%2F%2Fgnosis-safe.llamapay.io%2Fsalaries%2Fwithdraw%2F${chain?.chainName}%2F${stream.streamId}`
          return <StreamListItem stream={stream} url={url} key={stream.streamId} username={username} />
        })}
      </StyledList>
    ),
    [chain?.chainName, router.query.safe, streams, users],
  )

  const getWidgetBody = () => {
    if (loading) return LoadingState
    if (!streams.length) return <EmptyState />
    return ResultState
  }

  return (
    <WidgetContainer>
      <StyledWidgetTitle>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Streams
        </Typography>
        {streams.length > 0 && (
          <ViewAllLink
            url={`https://app.safe.global/${router.query.safe}/apps?appUrl=https%3A%2F%2Fgnosis-safe.llamapay.io`}
          />
        )}
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
      <Button
        size="small"
        variant="contained"
        color="primary"
        sx={{ ml: 'auto', mt: 2 }}
        onClick={() => setModalOpen(true)}
      >
        Create stream
      </Button>
      <NewStreamModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </WidgetContainer>
  )
}

export default StreamsList
