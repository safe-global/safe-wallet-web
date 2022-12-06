import { useMemo } from 'react'
import * as txSender from '@/services/tx/tx-sender'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

// Extends the return type of each txSender function by undefined
export type NullableTxSenderFunctions = {
  [K in keyof typeof txSender]: (...args: Parameters<typeof txSender[K]>) => undefined | ReturnType<typeof txSender[K]>
}

const useTxSender = (): NullableTxSenderFunctions => {
  const sdk = useSafeSDK()

  return useMemo(
    () =>
      (Object.keys(txSender) as Array<keyof typeof txSender>).reduce((result, key) => {
        result[key] = sdk ? txSender[key] : () => undefined
        return result
      }, Object.create(null)),
    [sdk],
  )
}

export default useTxSender
