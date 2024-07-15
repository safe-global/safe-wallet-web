import { useRouter } from 'next/router'
import { TxListGrid } from '@/components/transactions/TxList'
import { TransactionSkeleton } from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import ExpandableMsgItem from '../MsgListItem/ExpandableMsgItem'
import useSafeMessage from '@/hooks/messages/useSafeMessage'
import ErrorMessage from '@/components/tx/ErrorMessage'

const SingleMsg = () => {
  const router = useRouter()
  const { messageHash } = router.query
  const safeMessageHash = Array.isArray(messageHash) ? messageHash[0] : messageHash
  const [safeMessage, _, messageError] = useSafeMessage(safeMessageHash)

  if (safeMessage) {
    return (
      <TxListGrid>
        <ExpandableMsgItem msg={safeMessage} expanded />
      </TxListGrid>
    )
  }

  if (messageError) {
    return <ErrorMessage error={messageError}>Failed to load message</ErrorMessage>
  }

  // Loading skeleton
  return <TransactionSkeleton />
}

export default SingleMsg
