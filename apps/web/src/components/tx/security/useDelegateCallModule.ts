import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { DelegateCallModule } from '@/services/security/modules/DelegateCallModule'
import type { DelegateCallModuleResponse } from '@/services/security/modules/DelegateCallModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import { useCurrentChain } from '@/hooks/useChains'

const DelegateCallModuleInstance = new DelegateCallModule()

// TODO: Not being used right now
export const useDelegateCallModule = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeLoaded } = useSafeInfo()
  const currentChain = useCurrentChain()

  return useAsync<SecurityResponse<DelegateCallModuleResponse>>(() => {
    if (!safeTransaction || !safeLoaded || !currentChain) {
      return
    }

    return DelegateCallModuleInstance.scanTransaction({
      safeTransaction,
      safeVersion: safe.version,
      chain: currentChain,
    })
  }, [safeTransaction, safeLoaded, safe.version, currentChain])
}
