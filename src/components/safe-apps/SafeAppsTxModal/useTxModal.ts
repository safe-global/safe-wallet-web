import { useCallback, useState } from 'react'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'

type TxModalState = {
  isOpen: boolean
  txs: BaseTransaction[]
  requestId: RequestId
  params?: SendTransactionRequestParams
}

const INITIAL_CONFIRM_TX_MODAL_STATE: TxModalState = {
  isOpen: false,
  txs: [],
  requestId: '',
  params: undefined,
}

type ReturnType = [
  TxModalState,
  (txs: BaseTransaction[], params: SendTransactionRequestParams | undefined, requestId: RequestId) => void,
  () => void,
]

const useTxModal = (): ReturnType => {
  const [txModalState, setTxModalState] = useState<TxModalState>(INITIAL_CONFIRM_TX_MODAL_STATE)

  const openTxModal = useCallback(
    (txs: BaseTransaction[], params: SendTransactionRequestParams | undefined, requestId: RequestId) =>
      setTxModalState({
        isOpen: true,
        txs,
        requestId,
        params,
      }),
    [],
  )

  const closeTxModal = useCallback(() => setTxModalState(INITIAL_CONFIRM_TX_MODAL_STATE), [])

  return [txModalState, openTxModal, closeTxModal]
}

export default useTxModal
