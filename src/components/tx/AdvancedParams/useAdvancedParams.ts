import { useMemo, useState } from 'react'
import useGasPrice from '@/hooks/useGasPrice'
import { type AdvancedParameters } from './types'
import useUserNonce from './useUserNonce'
import { BigNumber } from 'ethers'

export const useAdvancedParams = ({
  nonce,
  gasLimit,
  safeTxGas,
}: AdvancedParameters): [AdvancedParameters, (params: AdvancedParameters) => void] => {
  const [manualParams, setManualParams] = useState<AdvancedParameters>()
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const userNonce = useUserNonce()

  const advancedParams: AdvancedParameters = useMemo(
    () => ({
      nonce: manualParams?.nonce ?? nonce,
      userNonce: manualParams?.userNonce ?? userNonce,
      gasLimit: BigNumber.from(0), //"manualParams?.gasLimit ?? gasLimit",
      maxFeePerGas: BigNumber.from(100000000),
      maxPriorityFeePerGas: BigNumber.from(100000000),
      safeTxGas: manualParams?.safeTxGas ?? safeTxGas,
    }),
    [manualParams, nonce, userNonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas, safeTxGas],
  )

  return [advancedParams, setManualParams]
}
