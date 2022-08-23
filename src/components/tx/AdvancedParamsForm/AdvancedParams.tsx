import GasParams from '@/components/tx/GasParams'
import { useState } from 'react'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm/index'

type Props = AdvancedParameters & {
  recommendedNonce?: number
  willExecute: boolean
  nonceReadonly: boolean
  isEstimating: boolean
  onFormSubmit: (data: AdvancedParameters) => void
}

const AdvancedParams = ({
  nonce,
  gasLimit,
  maxFeePerGas,
  maxPriorityFeePerGas,
  safeTxGas,
  recommendedNonce,
  willExecute,
  nonceReadonly,
  isEstimating,
  onFormSubmit,
}: Props) => {
  const [isEditingGas, setIsEditingGas] = useState<boolean>(false)

  const onAdvancedSubmit = (data: AdvancedParameters) => {
    onFormSubmit(data)

    setIsEditingGas(false)
  }

  return isEditingGas ? (
    <AdvancedParamsForm
      nonce={nonce}
      gasLimit={gasLimit}
      maxFeePerGas={maxFeePerGas}
      maxPriorityFeePerGas={maxPriorityFeePerGas}
      safeTxGas={safeTxGas}
      isExecution={willExecute}
      recommendedNonce={recommendedNonce}
      estimatedGasLimit={gasLimit?.toString()}
      nonceReadonly={nonceReadonly}
      onSubmit={onAdvancedSubmit}
    />
  ) : (
    <GasParams
      isExecution={willExecute}
      isLoading={isEstimating}
      nonce={nonce}
      gasLimit={gasLimit}
      maxFeePerGas={maxFeePerGas}
      maxPriorityFeePerGas={maxPriorityFeePerGas}
      safeTxGas={safeTxGas}
      onEdit={() => setIsEditingGas(true)}
    />
  )
}

export default AdvancedParams
