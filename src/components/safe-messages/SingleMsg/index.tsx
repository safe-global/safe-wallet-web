import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import { TxListGrid } from '@/components/transactions/TxList'
import { TransactionSkeleton } from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import useAsync from '@/hooks/useAsync'
import { fetchSafeMessage } from '@/hooks/messages/useSyncSafeMessageSigner'
import ExpandableMsgItem from '../MsgListItem/ExpandableMsgItem'
import ErrorMessage from '@/components/tx/ErrorMessage'

const SingleMsg = () => {
  const router = useRouter()
  const { messageHash } = router.query
  const safeMessageHash = Array.isArray(messageHash) ? messageHash[0] : messageHash
  const { safe, safeAddress } = useSafeInfo()

  const [message, messageError] = useAsync<SafeMessage>(
    () => {
      if (!safeMessageHash || !safeAddress) return
      return fetchSafeMessage(safeMessageHash, safe.chainId)
    },
    [safeMessageHash, safeAddress, safe.chainId],
    false,
  )

  if (messageError) {
    return <ErrorMessage error={messageError}>Failed to load message</ErrorMessage>
  }

  if (message) {
    return (
      <TxListGrid>
        <ExpandableMsgItem msg={message} expanded />
      </TxListGrid>
    )
  }

  // Loading skeleton
  return <TransactionSkeleton />
}

export default SingleMsg
