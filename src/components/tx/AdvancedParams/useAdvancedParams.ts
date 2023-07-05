import { useMemo, useState } from 'react'
import useGasPrice from '@/hooks/useGasPrice'
import { type AdvancedParameters } from './types'
import useUserNonce from './useUserNonce'

export const useAdvancedParams = ({
  nonce,
  gasLimit,
  safeTxGas,
}: AdvancedParameters): [AdvancedParameters, (params: AdvancedParameters) => void] => {
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const [gasPrice] = useGasPrice()
  const userNonce = useUserNonce()

  const advancedParams: AdvancedParameters = useMemo(
    () => ({
      nonce: manualParams?.nonce ?? nonce,
      userNonce: manualParams?.userNonce ?? userNonce,
      gasLimit: manualParams?.gasLimit ?? gasLimit,
      maxFeePerGas: manualParams?.maxFeePerGas ?? gasPrice?.maxFeePerGas,
      maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas ?? gasPrice?.maxPriorityFeePerGas,
      safeTxGas: manualParams?.safeTxGas ?? safeTxGas,
    }),
    [manualParams, nonce, userNonce, gasLimit, gasPrice?.maxFeePerGas, gasPrice?.maxPriorityFeePerGas, safeTxGas],
  )

  return [advancedParams, setManualParams]
}
