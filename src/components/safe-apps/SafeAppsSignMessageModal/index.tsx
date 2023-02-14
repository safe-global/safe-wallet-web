import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { EIP712TypedData, Methods, RequestId } from '@safe-global/safe-apps-sdk'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import SafeAppsModalLabel from '@/components/safe-apps/SafeAppsModalLabel'
import ReviewSafeAppsSignMessage from './ReviewSafeAppsSignMessage'

export type SafeAppsSignMessageParams = {
  appId?: number
  app?: SafeAppData
  requestId: RequestId
  message: string | EIP712TypedData
  method: Methods.signMessage | Methods.signTypedMessage
}

const SafeAppsSignSteps: TxStepperProps['steps'] = [
  {
    label: (data) => {
      const { app } = data as SafeAppsSignMessageParams

      return <SafeAppsModalLabel app={app} />
    },
    render: (data) => {
      return <ReviewSafeAppsSignMessage safeAppsSignMessage={data as SafeAppsSignMessageParams} />
    },
  },
]

const SafeAppsSignMessageModal = (
  props: Omit<TxModalProps, 'steps'> & { initialData: [SafeAppsSignMessageParams] },
) => {
  return <TxModal {...props} steps={SafeAppsSignSteps} />
}

export default SafeAppsSignMessageModal
