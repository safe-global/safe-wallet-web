import { useRouter } from 'next/router'
import { TxListGrid } from '@/components/transactions/TxList'
import { TransactionSkeleton } from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import ExpandableMsgItem from '../MsgListItem/ExpandableMsgItem'
import useSafeMessage from '@/hooks/messages/useSafeMessage'

const SingleMsg = () => {
  const router = useRouter()
  const { messageHash } = router.query
  const safeMessageHash = Array.isArray(messageHash) ? messageHash[0] : messageHash
  const [safeMessage] = useSafeMessage(safeMessageHash)

  if (safeMessage) {
    return (
      <TxListGrid>
        <ExpandableMsgItem msg={safeMessage} expanded />
      </TxListGrid>
    )
  }

  // Loading skeleton
  return <TransactionSkeleton />
}

export default SingleMsg
