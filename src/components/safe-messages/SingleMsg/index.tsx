import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { TxListGrid } from '@/components/transactions/TxList'
import { TransactionSkeleton } from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import useAsync from '@/hooks/useAsync'
import { fetchSafeMessage } from '@/hooks/messages/useSyncSafeMessageSigner'
import ExpandableMsgItem from '../MsgListItem/ExpandableMsgItem'
import ErrorMessage from '@/components/tx/ErrorMessage'

const SingleMsgGrid = ({ msg }: { msg: SafeMessage }): ReactElement => {
  // const tx: Transaction = makeTxFromDetails(txDetails)

  // Show a label for the transaction if it's a queued transaction
  // const { safe } = useSafeInfo()
  // const nonce = isMultisigDetailedExecutionInfo(txDetails?.detailedExecutionInfo)
  //   ? txDetails?.detailedExecutionInfo.nonce
  //   : -1
  // const label = nonce === safe.nonce ? LabelValue.Next : nonce > safe.nonce ? LabelValue.Queued : undefined

  return (
    <TxListGrid>
      {/* {label ? <GroupLabel item={{ label } as Label} /> : null} */}

      <ExpandableMsgItem msg={msg} />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const router = useRouter()
  const { messageHash } = router.query
  const safeMessageHash = Array.isArray(messageHash) ? messageHash[0] : messageHash
  const { safe, safeAddress } = useSafeInfo()

  const [message, messageError] = useAsync<SafeMessage>(
    () => {
      if (!safeMessageHash || !safeAddress) return

      return fetchSafeMessage(safeMessageHash, safe.chainId)
      // .then((message) => {
      // If the transaction is not related to the current safe, throw an error
      // if (!sameAddress(details.safeAddress, safeAddress)) {
      //   return Promise.reject(new Error('Transaction with this id was not found in this Safe Account'))
      // }
      // return message
      // })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safe.chainId, safe.txQueuedTag, safe.txHistoryTag, safeAddress],
    false,
  )

  if (messageError) {
    return <ErrorMessage error={messageError}>Failed to load message</ErrorMessage>
  }

  if (message) {
    return <SingleMsgGrid msg={message} />
  }

  // Loading skeleton
  return <TransactionSkeleton />
}

export default SingleTx
