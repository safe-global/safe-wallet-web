import { useCallback, useState } from 'react'
import { BaseTransaction, RequestId, SendTransactionRequestParams } from '@gnosis.pm/safe-apps-sdk'

type ConfirmTransactionModalState = {
  isOpen: boolean
  txs: BaseTransaction[]
  requestId: RequestId
  params?: SendTransactionRequestParams
}

const INITIAL_CONFIRM_TX_MODAL_STATE: ConfirmTransactionModalState = {
  isOpen: false,
  txs: [],
  requestId: '',
  params: undefined,
}

type ReturnType = [
  ConfirmTransactionModalState,
  (txs: BaseTransaction[], params: SendTransactionRequestParams | undefined, requestId: RequestId) => void,
  () => void,
]

const useConfirmTransactionModal = (): ReturnType => {
  const [confirmTransactionModalState, setConfirmTransactionModalState] =
    useState<ConfirmTransactionModalState>(INITIAL_CONFIRM_TX_MODAL_STATE)

  const openConfirmationModal = useCallback(
    (txs: BaseTransaction[], params: SendTransactionRequestParams | undefined, requestId: RequestId) =>
      setConfirmTransactionModalState({
        isOpen: true,
        txs,
        requestId,
        params,
      }),
    [],
  )

  const closeConfirmationModal = useCallback(() => setConfirmTransactionModalState(INITIAL_CONFIRM_TX_MODAL_STATE), [])

  return [confirmTransactionModalState, openConfirmationModal, closeConfirmationModal]
}

export default useConfirmTransactionModal
