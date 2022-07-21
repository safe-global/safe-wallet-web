import { Transaction, TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

export const useGroupedItems = (groupedListItems: Transaction[]) => {
  const [items, setItems] = useState<Transaction[]>(groupedListItems)
  const pendingTxs = useAppSelector(selectPendingTxs)

  useEffect(() => {
    const pendingTxInGroup = groupedListItems.find((item) => pendingTxs[item.transaction.id])

    if (!pendingTxInGroup) {
      setItems(groupedListItems)
      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.transaction.id === pendingTxInGroup.transaction.id) return item

        return {
          ...item,
          transaction: {
            ...item.transaction,
            txStatus: TransactionStatus.WILL_BE_REPLACED,
          },
        }
      }),
    )
  }, [groupedListItems, pendingTxs])

  return items
}
