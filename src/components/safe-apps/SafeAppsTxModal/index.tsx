import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'
import InvalidTransaction from './InvalidTransaction'
import SafeAppsTxModalLabel from './SafeAppsTxModalLabel'
import { isTxValid } from './utils'

export type SafeAppsTxParams = {
  appId?: string
  app?: SafeAppData
  requestId: RequestId
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
}

const SafeAppsTxSteps: TxStepperProps['steps'] = [
  {
    label: (data) => {
      const { app } = data as SafeAppsTxParams

      return <SafeAppsTxModalLabel app={app} />
    },
    render: (data, onSubmit) => {
      if (!isTxValid((data as SafeAppsTxParams).txs)) {
        return <InvalidTransaction />
      }

      return <ReviewSafeAppsTx onSubmit={onSubmit} safeAppsTx={data as SafeAppsTxParams} />
    },
  },
]

const SafeAppsTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SafeAppsTxSteps} />
}

export default SafeAppsTxModal
