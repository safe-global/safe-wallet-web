import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useEffect, useState } from 'react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createExistingTx } from '@/services/tx/tx-sender'

export const useSafeTransaction = (txId: string) => {
  const safeSdk = useSafeSDK()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const [safeTx, setSafeTx] = useState<SafeTransaction>()

  useEffect(() => {
    if (!safeSdk) {
      return
    }
    createExistingTx(chainId, safeAddress, txId).then(setSafeTx)
  }, [chainId, safeAddress, txId, safeSdk])

  return safeTx
}
