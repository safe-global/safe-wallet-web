import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { fetchTxHistory, selectTxHistory, setPageUrl } from 'store/txHistorySlice'

const useTxHistory = (): void => {
  const { safe } = useAppSelector(selectSafeInfo)
  const { pageUrl } = useAppSelector(selectTxHistory)
  const dispatch = useAppDispatch()
  const { chainId, txHistoryTag } = safe
  const address = safe.address.value
  const [, setPrevAddress] = useState<[string, string]>([chainId, address])

  // Fetch TxHistory when the Safe address, txHistoryTag, or pageUrl is updated
  useEffect(() => {
    setPrevAddress((prev) => {
      // If Safe chainId/address has changed, reset the pageUrl
      const [prevChainId, prevAddress] = prev
      if (prevChainId !== chainId || prevAddress !== address) {
        dispatch(setPageUrl(undefined))
        return [chainId, address]
      }

      // Otherwise, if pageUrl or txHistoryTag have changed, fetch new history
      dispatch(fetchTxHistory({ chainId, address, pageUrl }))

      // And keep the previous chainId/address unchanged
      return prev
    })
  }, [dispatch, chainId, address, txHistoryTag, pageUrl, setPrevAddress])
}

export default useTxHistory
