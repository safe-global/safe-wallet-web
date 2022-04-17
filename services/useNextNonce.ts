import type { MultisigExecutionInfo, Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { getLastQueue } from './useTxQueue'

const useNextNonce = (): { nonce?: number; nonceError?: Error } => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { qLastItems, qError, qLoading } = getLastQueue()

  if (qLoading) return {}

  if (qError) return { nonceError: qError }

  // No queue items, return Safe nonce
  if (qLastItems?.length === 0) {
    return { nonce: safe?.nonce }
  }

  // Find the latest queued tx with a nonce
  if (qLastItems?.length) {
    const lastMultisigTx = qLastItems.find(
      (item) => item.type === 'TRANSACTION' && item.transaction.executionInfo?.type === 'MULTISIG',
    ) as Transaction
    const lastNonce = (lastMultisigTx?.transaction.executionInfo as MultisigExecutionInfo)?.nonce
    if (lastNonce) {
      return { nonce: lastNonce + 1 }
    }
  }

  return {}
}

export default useNextNonce
