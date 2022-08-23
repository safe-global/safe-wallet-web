import { useState } from 'react'
import useGasPrice from '@/hooks/useGasPrice'
import { type AdvancedParameters } from './types'
import useUserNonce from './useUserNonce'

export const useAdvancedParams = ({
  nonce,
  gasLimit,
  safeTxGas,
}: Partial<AdvancedParameters>): [AdvancedParameters, (params: AdvancedParameters) => void] => {
  const { maxFeePerGas, maxPriorityFeePerGas } = useGasPrice()
  const userNonce = useUserNonce()

  return useState<AdvancedParameters>({
    nonce,
    userNonce,
    safeTxGas,
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  })
}
