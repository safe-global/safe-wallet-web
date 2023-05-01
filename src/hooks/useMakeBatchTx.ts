import { useEffect, useState } from 'react'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createExistingTx, createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import useChainId from './useChainId'
import { useBatchTxId } from './useDraftBatch'
import useSafeAddress from './useSafeAddress'
import { getDecodedData } from '@safe-global/safe-gateway-typescript-sdk'
import { isEmptyHexData } from '@/utils/hex'

const getData = (data: MetaTransactionData): MetaTransactionData => {
  return {
    to: data.to,
    value: data.value,
    data: data.data || '0x',
    operation: data.operation,
  }
}

const useMakeBatchTx = (tx: SafeTransaction | undefined): [SafeTransaction | undefined, Error | undefined] => {
  const batchTxId = useBatchTxId()
  const [combinedTx, setCombinedTx] = useState<SafeTransaction | undefined>()
  const [error, setError] = useState<Error | undefined>()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()

  useEffect(() => {
    if (!tx) return

    const init = async () => {
      let calls: MetaTransactionData[] = []

      if (batchTxId) {
        const batchTx = await createExistingTx(chainId, safeAddress, batchTxId)
        const isEmptyData = isEmptyHexData(batchTx.data.data)

        if (isEmptyData) {
          calls = [batchTx.data]
        } else {
          const decoded = await getDecodedData(chainId, batchTx.data.data)
          // FIXME update CGW SDK type
          const { parameters } = decoded as unknown as {
            parameters: [{ valueDecoded: MetaTransactionData | MetaTransactionData[] }]
          }
          calls = calls.concat(parameters[0].valueDecoded).map(getData)
        }
      }

      // Add the new tx to the batch
      calls.push(getData(tx.data))

      return await createMultiSendCallOnlyTx(calls)
    }

    init().then(setCombinedTx).catch(setError)
  }, [tx, batchTxId, chainId, safeAddress])

  return [combinedTx, error]
}

export default useMakeBatchTx
