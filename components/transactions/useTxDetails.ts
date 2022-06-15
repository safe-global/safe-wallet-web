import { useEffect } from 'react'
import { getTransactionDetails, type TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectTxDetails, setTxDetails } from '@/store/txDetailsSlice'
import useChainId from '@/services/useChainId'
import useAsync from '@/services/useAsync'

const useTxDetails = ({
  txId,
}: {
  txId: string
}): { txDetails: TransactionDetails | undefined; error: Error | undefined; loading: boolean } => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const txDetails = useAppSelector((state) => selectTxDetails(state, { chainId, txId }))

  const [data, error, loading] = useAsync(async () => {
    if (txDetails || !chainId || !txId) return
    return getTransactionDetails(chainId, txId)
  }, [chainId, txId])

  useEffect(() => {
    if (!data || !chainId) return
    dispatch(setTxDetails({ chainId, txDetails: data }))
  }, [data, chainId, dispatch])

  return { txDetails: data, error, loading }
}

export default useTxDetails
