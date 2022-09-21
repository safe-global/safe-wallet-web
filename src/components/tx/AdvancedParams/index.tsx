import GasParams from '@/components/tx/GasParams'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import { useState } from 'react'
import AdvancedParamsForm from './AdvancedParamsForm'
import { type AdvancedParameters } from './types'

type Props = {
  params: AdvancedParameters
  recommendedNonce?: number
  recommendedGasLimit?: AdvancedParameters['gasLimit']
  willExecute: boolean
  nonceReadonly: boolean
  onFormSubmit: (data: AdvancedParameters) => void
}

const AdvancedParams = ({
  params,
  recommendedNonce,
  recommendedGasLimit,
  willExecute,
  nonceReadonly,
  onFormSubmit,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const onEditOpen = () => {
    setIsEditing(true)
    trackEvent(MODALS_EVENTS.EDIT_ADVANCED_PARAMS)
  }

  const onAdvancedSubmit = (data: AdvancedParameters) => {
    onFormSubmit(data)
    setIsEditing(false)
  }

  return isEditing ? (
    <AdvancedParamsForm
      params={params}
      isExecution={willExecute}
      recommendedNonce={recommendedNonce}
      recommendedGasLimit={recommendedGasLimit}
      nonceReadonly={nonceReadonly}
      onSubmit={onAdvancedSubmit}
    />
  ) : (
    <GasParams params={params} isExecution={willExecute} onEdit={onEditOpen} />
  )
}

export default AdvancedParams

export * from './useAdvancedParams'

export * from './types.d'
