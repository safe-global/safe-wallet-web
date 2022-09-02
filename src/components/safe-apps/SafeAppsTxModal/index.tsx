import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'

export type SafeAppsTxParams = {
  appId?: string
  app?: SafeAppData
  requestId: RequestId
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
}

const SafeAppsTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Safe Apps transaction',
    render: (data, onSubmit) => <ReviewSafeAppsTx onSubmit={onSubmit} safeAppsTx={data as SafeAppsTxParams} />,
  },
]

const SafeAppsTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SafeAppsTxSteps} />
}

export default SafeAppsTxModal
