import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { estimateSafeTxGas } from '@/services/tx/txSender'
import { isEnabledByVersion } from '@/utils/safes'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'

const DEFAULT_ESTIMATION = '0'

const useSafeTxGas = ({
  isRejection,
  safeTx,
}: {
  isRejection: boolean
  safeTx?: SafeTransaction
}): { safeTxGas: string; safeTxGasError: Error | undefined } => {
  const { safe } = useSafeInfo()

  const [safeTxGas, safeTxGasError] = useAsync<string>(() => {
    if (isRejection || !safeTx || isEnabledByVersion(FEATURES.SAFE_TX_GAS_OPTIONAL, safe.version)) {
      return Promise.resolve(DEFAULT_ESTIMATION)
    }

    return estimateSafeTxGas(safe.chainId, safe.address.value, safeTx.data).then(({ safeTxGas }) => safeTxGas)
  }, [safe, safeTx, DEFAULT_ESTIMATION])

  return { safeTxGas: safeTxGas || DEFAULT_ESTIMATION, safeTxGasError }
}

export default useSafeTxGas
