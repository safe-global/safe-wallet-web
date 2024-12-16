import { GroupedTxs } from '@/src/features/TxHistory/utils'
import { Transaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

export const groupBulkTxs = <T extends { type: string; transaction?: Transaction }>(
  list: GroupedTxs<T>,
): GroupedTxs<T> => {
  const grouped = list
    .reduce<GroupedTxs<T>>((resultItems, item) => {
      if (Array.isArray(item) || item.type !== 'TRANSACTION') {
        return resultItems.concat([item])
      }
      const currentTxHash = item.transaction?.txHash

      const prevItem = resultItems[resultItems.length - 1]
      if (!Array.isArray(prevItem)) {
        return resultItems.concat([[item]])
      }
      const prevTxHash = prevItem[0]?.transaction?.txHash

      if (currentTxHash && currentTxHash === prevTxHash) {
        prevItem.push(item)
        return resultItems
      }

      return resultItems.concat([[item]])
    }, [])
    .map((item) => (Array.isArray(item) && item.length === 1 ? item[0] : item))

  return grouped
}
