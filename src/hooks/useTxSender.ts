import { useMemo } from 'react'
import * as txSender from '@/services/tx/tx-sender'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

const useTxSender = () => {
  const sdk = useSafeSDK()

  return useMemo(
    () => ({
      ...txSender,
    }),
    [sdk],
  )
}

export default useTxSender
