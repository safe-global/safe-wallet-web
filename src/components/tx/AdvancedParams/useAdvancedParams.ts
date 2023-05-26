import { useMemo, useState } from 'react'
import useGasPrice from '@/hooks/useGasPrice'
import { type AdvancedParameters } from './types'
import useUserNonce from './useUserNonce'

export const useAdvancedParams = (
  gasLimit?: AdvancedParameters['gasLimit'],
  nonce?: AdvancedParameters['nonce'],
  safeTxGas?: AdvancedParameters['safeTxGas'],
): [AdvancedParameters, (params: AdvancedParameters) => void] => {
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const userNonce = useUserNonce()

  const advancedParams: AdvancedParameters = useMemo(
    () => ({
      nonce: manualParams?.nonce ?? nonce,
      userNonce: manualParams?.userNonce ?? userNonce,
      gasLimit: manualParams?.gasLimit ?? gasLimit,
      maxFeePerGas: manualParams?.maxFeePerGas ?? maxFeePerGas,
      maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas ?? maxPriorityFeePerGas,
      safeTxGas: manualParams?.safeTxGas ?? safeTxGas,
    }),
    [manualParams, nonce, userNonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas, safeTxGas],
  )

  return [advancedParams, setManualParams]
}
