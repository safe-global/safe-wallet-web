import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { asError } from '@/services/exceptions/utils'
import { getRecoveredSafeInfo } from '@/services/recovery/transaction-list'
import { useIsValidRecoveryExecution } from './useIsValidRecoveryExecution'
import useSafeInfo from './useSafeInfo'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'
import type { AsyncResult } from './useAsync'

export function useRecoveredSafeInfo(recovery: RecoveryQueueItem): AsyncResult<SafeInfo> {
  const [isValid, error, loading] = useIsValidRecoveryExecution(recovery)
  const { safe } = useSafeInfo()

  if (!isValid || error) {
    return [undefined, error, loading]
  }

  try {
    const newSetup = getRecoveredSafeInfo(safe, {
      to: recovery.args.to,
      value: recovery.args.value.toString(),
      data: recovery.args.data,
    })

    return [newSetup, error, loading]
  } catch (_error) {
    return [undefined, asError(_error), loading]
  }
}
