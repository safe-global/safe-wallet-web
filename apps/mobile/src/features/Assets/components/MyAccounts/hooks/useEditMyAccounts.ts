import { selectActiveSafe, setActiveSafe } from '@/src/store/activeSafeSlice'
import { toggleMode } from '@/src/store/myAccountsSlice'
import { removeSafe, SafesSliceItem, selectAllSafes, setSafes } from '@/src/store/safesSlice'
import { Address } from '@/src/types/address'
import { useCallback, useState } from 'react'
import { DragEndParams } from 'react-native-draggable-flatlist'
import { useDispatch, useSelector } from 'react-redux'

type useEditMyAccountsReturn = {
  safes: SafesSliceItem[]
  onDragEnd: (params: DragEndParams<SafesSliceItem>) => void
  onSafeDeleted: (address: Address) => () => void
}

export const useEditMyAccounts = (): useEditMyAccountsReturn => {
  const dispatch = useDispatch()
  const safes = useSelector(selectAllSafes)
  const activeSafe = useSelector(selectActiveSafe)
  const [sortableSafes, setSortableSafes] = useState(() => Object.values(safes))

  const onDragEnd = useCallback(({ data }: DragEndParams<SafesSliceItem>) => {
    setSortableSafes([...data])

    // Defer Redux update due to incompatibility issues between
    // react-native-draggable-flatlist and new architecture.
    setTimeout(() => {
      const safes = data.reduce((acc, item) => ({ ...acc, [item.SafeInfo.address.value]: item }), {})
      dispatch(setSafes(safes))
    }, 0) // Ensure this happens after the re-render
  }, [])

  const onSafeDeleted = useCallback(
    (address: Address) => () => {
      if (activeSafe.address === address) {
        const safe = sortableSafes.find((item) => item.SafeInfo.address.value !== address)

        if (safe) {
          dispatch(
            setActiveSafe({
              address: safe.SafeInfo.address.value as Address,
              chainId: safe.chains[0],
            }),
          )
        }
      }

      if (sortableSafes.length <= 2) {
        dispatch(toggleMode())
      }

      dispatch(removeSafe(address))
    },
    [sortableSafes, activeSafe],
  )

  return { safes: sortableSafes, onDragEnd, onSafeDeleted }
}
