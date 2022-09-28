import { useCallback, useState } from 'react'

const useTransactionQueueBarState = () => {
  const [expanded, setExpanded] = useState(false)
  const [dismissedByUser, setDismissedByUser] = useState(false)

  const dismissQueueBar = useCallback((): void => {
    setDismissedByUser(true)
  }, [])

  return {
    expanded,
    dismissedByUser,
    setExpanded,
    dismissQueueBar,
  }
}

export default useTransactionQueueBarState
