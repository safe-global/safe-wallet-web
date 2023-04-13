import GasParams from '@/components/tx/GasParams'
import SponsoredBy from '@/components/tx/SponsoredBy'
import { useCurrentChain } from '@/hooks/useChains'
import { useRemainingRelaysBySafe } from '@/hooks/useRemainingRelays'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import { FEATURES, hasFeature } from '@/utils/chains'
import { Box } from '@mui/material'
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
  gasLimitError?: Error
  willRelay?: boolean
}

const AdvancedParams = ({
  params,
  recommendedNonce,
  recommendedGasLimit,
  willExecute,
  nonceReadonly,
  onFormSubmit,
  gasLimitError,
  willRelay,
}: Props) => {
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const chain = useCurrentChain()
  const isEIP1559 = !!chain && hasFeature(chain, FEATURES.EIP1559)
  const [remainingRelays] = useRemainingRelaysBySafe()

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
      isEIP1559={isEIP1559}
      willRelay={willRelay}
    />
  ) : (
    <>
      <GasParams
        params={params}
        isExecution={willExecute}
        isEIP1559={isEIP1559}
        gasLimitError={gasLimitError}
        onEdit={onEditOpen}
        willRelay={willRelay}
      />
      {willRelay && !!remainingRelays ? (
        <Box
          sx={{
            '& > div': {
              marginTop: '-1px',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            },
          }}
        >
          <SponsoredBy remainingRelays={remainingRelays} />
        </Box>
      ) : null}
    </>
  )
}

export default AdvancedParams

export * from './useAdvancedParams'

export * from './types.d'
