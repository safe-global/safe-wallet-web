import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { DelegateCallModule } from '@/services/security/modules/DelegateCallModule'
import type { DelegateCallModuleResponse } from '@/services/security/modules/DelegateCallModule'
import type { SecurityResponse } from '@/services/security/modules/types'

const DelegateCallModuleInstance = new DelegateCallModule()

// TODO: Not being used right now
export const useDelegateCallModule = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeLoaded } = useSafeInfo()

  return useAsync<SecurityResponse<DelegateCallModuleResponse>>(() => {
    if (!safeTransaction || !safeLoaded) {
      return
    }

    return DelegateCallModuleInstance.scanTransaction({
      safeTransaction,
      safeVersion: safe.version,
      chainId: safe.chainId,
    })
  }, [safeTransaction, safeLoaded, safe.version, safe.chainId])
}
