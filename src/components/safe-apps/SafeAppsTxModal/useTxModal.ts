import { useCallback, useState } from 'react'
import type { BaseTransaction, RequestId, SendTransactionRequestParams } from '@safe-global/safe-apps-sdk'

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
  (txs: BaseTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) => void,
  () => void,
]

const useTxModal = (): ReturnType => {
  const [txModalState, setTxModalState] = useState<TxModalState>(INITIAL_CONFIRM_TX_MODAL_STATE)

  const openTxModal = useCallback(
    (txs: BaseTransaction[], requestId: RequestId, params?: SendTransactionRequestParams) =>
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
