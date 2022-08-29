import { ReactElement } from 'react'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'
import { DecodedDataParameterValue, DecodedDataResponse, SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ModalDialog from '@/components/common/ModalDialog'
import { SafeAppLoadError } from './SafeAppLoadError'
import { ReviewConfirm } from './ReviewConfirm'
import { validateAddress } from '@/utils/validation'

export type ConfirmTxModalProps = {
  isOpen: boolean
  app?: SafeAppData
  txs: BaseTransaction[]
  params?: SendTransactionRequestParams
  safeAddress: string
  requestId: RequestId
  ethBalance: string
  onUserConfirm: (safeTxHash: string, requestId: RequestId) => void
  onTxReject: (requestId: RequestId) => void
  onClose: () => void
  appId?: string
}

const isTxValid = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

export type DecodedTxDetailType = DecodedDataParameterValue | DecodedDataResponse | undefined

export const ConfirmTxModal = (props: ConfirmTxModalProps): ReactElement => {
  const invalidTransactions = !props.txs.length || props.txs.some((t) => !isTxValid(t))

  const rejectTransaction = () => {
    props.onClose()
    props.onTxReject(props.requestId)
  }

  return (
    <ModalDialog dialogTitle={props?.app?.name} open={props.isOpen}>
      {invalidTransactions ? (
        <SafeAppLoadError {...props} />
      ) : (
        <ReviewConfirm {...props} onReject={rejectTransaction} />
      )}
    </ModalDialog>
  )
}
