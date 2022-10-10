import { useCallback, useState } from 'react'
import useTxQueue from '@/hooks/useTxQueue'

const useTransactionQueueBarState = () => {
  const [expanded, setExpanded] = useState(false)
  const [dismissedByUser, setDismissedByUser] = useState(false)
  const { page = { results: [] } } = useTxQueue()

  const dismissQueueBar = useCallback((): void => {
    setDismissedByUser(true)
  }, [])

  return {
    expanded,
    dismissedByUser,
    setExpanded,
    dismissQueueBar,
    transactions: page,
  }
}

export default useTransactionQueueBarState
