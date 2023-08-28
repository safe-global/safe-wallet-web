import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type DecodedDataResponse, getDecodedData } from '@safe-global/safe-gateway-typescript-sdk'
import { getNativeTransferData } from '@/services/tx/tokenTransferParams'
import { isEmptyHexData } from '@/utils/hex'
import type { AsyncResult } from './useAsync'
import useAsync from './useAsync'
import useChainId from './useChainId'

const useDecodeTx = (tx?: SafeTransaction): AsyncResult<DecodedDataResponse> => {
  const chainId = useChainId()
  const encodedData = tx?.data.data
  const isEmptyData = !!encodedData && isEmptyHexData(encodedData)
  const isRejection = isEmptyData && tx?.data.value === '0'
  const nativeTransfer = isEmptyData && !isRejection ? getNativeTransferData(tx?.data) : undefined

  const [data = nativeTransfer, error, loading] = useAsync<DecodedDataResponse>(() => {
    if (!encodedData || isEmptyData) return
    return getDecodedData(chainId, encodedData, tx.data.to)
  }, [chainId, encodedData, isEmptyData, tx?.data.to])

  return [data, error, loading]
}

export default useDecodeTx
