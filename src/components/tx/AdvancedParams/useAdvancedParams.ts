import { useMemo, useState } from 'react'
import useGasPrice from '@/hooks/useGasPrice'
import { type AdvancedParameters } from './types'
import useUserNonce from './useUserNonce'

export const useAdvancedParams = (
  gasLimit?: AdvancedParameters['gasLimit'],
): [AdvancedParameters, (params: AdvancedParameters) => void] => {
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const userNonce = useUserNonce()

  const advancedParams: AdvancedParameters = useMemo(
    () => ({
      userNonce: manualParams?.userNonce ?? userNonce,
      gasLimit: manualParams?.gasLimit ?? gasLimit,
      maxFeePerGas: manualParams?.maxFeePerGas ?? maxFeePerGas,
      maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas ?? maxPriorityFeePerGas,
    }),
    [manualParams, userNonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas],
  )

  return [advancedParams, setManualParams]
}
