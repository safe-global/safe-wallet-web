import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import TxModal, { TxModalProps } from '@/components/tx/TxModal'
import ReviewSafeAppsTx from './ReviewSafeAppsTx'
import InvalidTransaction from './InvalidTransaction'
import { validateAddress } from '@/utils/validation'

const isTxValid = (txs: BaseTransaction[]) => txs.length && txs.every((t) => validateTransaction(t))

const validateTransaction = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

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
