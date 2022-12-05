import { useMemo } from 'react'
import * as txSender from '@/services/tx/tx-sender'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

// Extends the return type of each txSender function by undefined
type NullableTxSenderFunctions = {
  [K in keyof typeof txSender]: (...args: Parameters<typeof txSender[K]>) => undefined | ReturnType<typeof txSender[K]>
}

const useTxSender = (): NullableTxSenderFunctions => {
  const sdk = useSafeSDK()

  // @ts-ignore
  return useMemo(
    () =>
      Object.keys(txSender).reduce((result, key) => {
        // @ts-ignore
        result[key] = async (...args) => (sdk ? txSender[key](...args) : undefined)
        return result
      }, {}),
    [sdk],
  )
}

export default useTxSender
