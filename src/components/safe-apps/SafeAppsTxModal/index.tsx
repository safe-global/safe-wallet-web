import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { BaseTransaction, RequestId, SendTransactionRequestParams } from '@safe-global/safe-apps-sdk'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { TxModalProps } from '@/components/tx/TxModal'
import TxModal from '@/components/tx/TxModal'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'
import InvalidTransaction from './InvalidTransaction'
import SafeAppsTxModalLabel from '@/components/safe-apps/SafeAppsModalLabel'
import { isTxValid } from '@/components/safe-apps/utils'

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
    render: (data) => {
      if (!isTxValid((data as SafeAppsTxParams).txs)) {
        return <InvalidTransaction />
      }

      return <ReviewSafeAppsTx safeAppsTx={data as SafeAppsTxParams} />
    },
  },
]

const SafeAppsTxModal = (props: Omit<TxModalProps, 'steps'>) => {
  return <TxModal {...props} steps={SafeAppsTxSteps} />
}

export default SafeAppsTxModal
