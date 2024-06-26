import useAsync from '@/hooks/useAsync'

import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'

import type EthSafeOperation from '@safe-global/relay-kit/dist/src/packs/safe-4337/SafeOperation'
import { useSafe4337Pack } from './useSafe4337Pack'

/**
 * Transforms SafeTx into UserOperation and estimates it
 * @param safeTx
 * @returns
 */
const useEstimatedUserOperation = (safeTx?: SafeTransaction) => {
  const [safe4337Pack] = useSafe4337Pack()

  return useAsync<EthSafeOperation | undefined>(async () => {
    if (!safe4337Pack || !safeTx) return

    console.log('Creating userOp')

    // create user operation
    const safeOperation = await safe4337Pack.createTransaction({
      transactions: [
        {
          data: safeTx.data.data,
          to: safeTx.data.to,
          value: safeTx.data.value,
          operation: safeTx.data.operation,
        },
      ],
    })

    console.log('User Operation', safeOperation)

    return safe4337Pack.getEstimateFee({
      safeOperation,
    })
  }, [safe4337Pack, safeTx])
}

export default useEstimatedUserOperation
