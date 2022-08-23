import GasParams from '@/components/tx/GasParams'
import { useState } from 'react'
import AdvancedParamsForm, { AdvancedParameters } from '@/components/tx/AdvancedParamsForm/index'

type Props = AdvancedParameters & {
  recommendedNonce?: number
  willExecute: boolean
  nonceReadonly: boolean
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
  onFormSubmit,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const onAdvancedSubmit = (data: AdvancedParameters) => {
    onFormSubmit(data)

    setIsEditing(false)
  }

  return isEditing ? (
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
      nonce={nonce}
      gasLimit={gasLimit}
      maxFeePerGas={maxFeePerGas}
      maxPriorityFeePerGas={maxPriorityFeePerGas}
      safeTxGas={safeTxGas}
      onEdit={() => setIsEditing(true)}
    />
  )
}

export default AdvancedParams
