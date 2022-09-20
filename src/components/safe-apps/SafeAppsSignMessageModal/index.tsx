import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { EIP712TypedData, Methods, RequestId } from '@gnosis.pm/safe-apps-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import SafeAppsModalLabel from '../SafeAppsModalLabel'
import ReviewSafeAppsSignMessage from './ReviewSafeAppsSignMessage'

export type SafeAppsSignMessageParams = {
  appId?: string
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

const SafeAppsSignMessageModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SafeAppsSignSteps} />
}

export default SafeAppsSignMessageModal
