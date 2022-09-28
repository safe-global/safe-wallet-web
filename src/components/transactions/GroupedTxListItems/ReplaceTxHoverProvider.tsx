import { createContext, useMemo, useState, type Dispatch, type ReactElement, type SetStateAction } from 'react'
import type { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

export const ReplaceTxHoverContext = createContext<{
  replacedTxIds: string[]
  setExecutoryTxId: Dispatch<SetStateAction<string | undefined>>
}>({
  replacedTxIds: [],
  setExecutoryTxId: () => {},
})

// Used for striking through transactions that will be replaced
export const ReplaceTxHoverProvider = ({
  groupedListItems,
  children,
}: {
  groupedListItems: Transaction[]
  children: ReactElement
}): ReactElement => {
  const [executoryTxId, setExecutoryTxId] = useState<string>()
  const pendingTxs = useAppSelector(selectPendingTxs)

  const replacedTxIds = useMemo(() => {
    const pendingTxInGroup = groupedListItems.find((item) => pendingTxs[item.transaction.id])

    const disabledItems = groupedListItems
      .filter((item) => {
        const { id } = item.transaction

        const willBeReplaced = executoryTxId && executoryTxId !== id
        const isReplacing = pendingTxInGroup && id !== pendingTxInGroup.transaction.id

        return willBeReplaced || isReplacing
      })
      .map((item) => item.transaction.id)

    return disabledItems
  }, [groupedListItems, pendingTxs, executoryTxId])

  return (
    <ReplaceTxHoverContext.Provider
      value={{
        replacedTxIds,
        setExecutoryTxId,
      }}
    >
      {children}
    </ReplaceTxHoverContext.Provider>
  )
}
