import { createContext, useMemo, useState, type Dispatch, type ReactElement, type SetStateAction } from 'react'
import type { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'

import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

export const WillReplaceContext = createContext<{
  willReplace: string[]
  setWillExecute: Dispatch<SetStateAction<string | undefined>>
}>({
  willReplace: [],
  setWillExecute: () => {},
})

// Used for striking through transactions that will be replaced
export const WillReplaceProvider = ({
  groupedListItems,
  children,
}: {
  groupedListItems: Transaction[]
  children: ReactElement
}): ReactElement => {
  const [willExecute, setWillExecute] = useState<string>()
  const pendingTxs = useAppSelector(selectPendingTxs)

  const willReplace = useMemo(() => {
    const pendingTxInGroup = groupedListItems.find((item) => pendingTxs[item.transaction.id])

    const disabledItems = groupedListItems
      .filter((item) => {
        const { id } = item.transaction

        const willReplace = willExecute && willExecute !== id
        const isReplacing = pendingTxInGroup && id !== pendingTxInGroup.transaction.id

        return willReplace || isReplacing
      })
      .map((item) => item.transaction.id)

    return disabledItems
  }, [groupedListItems, pendingTxs, willExecute])

  return (
    <WillReplaceContext.Provider
      value={{
        willReplace,
        setWillExecute,
      }}
    >
      {children}
    </WillReplaceContext.Provider>
  )
}
