import { useState, useCallback } from 'react'
import type { EIP712TypedData } from '@gnosis.pm/safe-apps-sdk'
import { Methods } from '@gnosis.pm/safe-apps-sdk'

type StateType = { isOpen: boolean; message: string | EIP712TypedData; requestId: string; method: Methods }

const INITIAL_MODAL_STATE: StateType = {
  isOpen: false,
  message: '',
  requestId: '',
  method: Methods.signMessage,
}

type ReturnType = [
  StateType,
  (
    message: string | EIP712TypedData,
    requestId: string,
    method: Methods.signMessage | Methods.signTypedMessage,
  ) => void,
  () => void,
]

const useSignMessageModal = (): ReturnType => {
  const [signMessageModalState, setSignMessageModalState] = useState<StateType>(INITIAL_MODAL_STATE)

  const openSignMessageModal = useCallback((message: string | EIP712TypedData, requestId: string, method: Methods) => {
    setSignMessageModalState({
      ...INITIAL_MODAL_STATE,
      isOpen: true,
      message,
      requestId,
      method,
    })
  }, [])

  const closeSignMessageModal = useCallback(() => {
    setSignMessageModalState(INITIAL_MODAL_STATE)
  }, [])

  return [signMessageModalState, openSignMessageModal, closeSignMessageModal]
}

export default useSignMessageModal
