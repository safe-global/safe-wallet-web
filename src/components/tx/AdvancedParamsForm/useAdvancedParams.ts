import { useState } from 'react'
import { AdvancedParameters } from '@/components/tx/AdvancedParamsForm/index'

const useAdvancedParams = ({ nonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas, safeTxGas }: AdvancedParameters) => {
  const [manualParams, setManualParams] = useState<AdvancedParameters>()

  const advancedParams: Partial<AdvancedParameters> = {
    nonce: manualParams?.nonce || nonce,
    gasLimit: manualParams?.gasLimit || gasLimit,
    maxFeePerGas: manualParams?.maxFeePerGas || maxFeePerGas,
    maxPriorityFeePerGas: manualParams?.maxPriorityFeePerGas || maxPriorityFeePerGas,
    safeTxGas: manualParams?.safeTxGas || safeTxGas,
  }

  return { advancedParams, setManualParams }
}

export default useAdvancedParams
