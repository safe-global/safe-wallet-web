import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

export const useGroupedItems = (groupedListItems: Transaction[]) => {
  const [items, setItems] = useState<string[]>([])
  const pendingTxs = useAppSelector(selectPendingTxs)

  useEffect(() => {
    const pendingTxInGroup = groupedListItems.find((item) => pendingTxs[item.transaction.id])

    if (!pendingTxInGroup) {
      setItems([])
      return
    }

    const disabledItems = groupedListItems
      .filter((item) => item.transaction.id !== pendingTxInGroup.transaction.id)
      .map((item) => item.transaction.id)

    setItems(disabledItems)
  }, [groupedListItems, pendingTxs])

  return items
}
