import { useState, useCallback } from 'react'
import type { EIP712TypedData } from '@safe-global/safe-apps-sdk'
import { Methods } from '@safe-global/safe-apps-sdk'

type StateType = {
  isOpen: boolean
  message: string | EIP712TypedData
  requestId: string
  method: Methods
  isOffChain: boolean
}

const INITIAL_MODAL_STATE: StateType = {
  isOpen: false,
  message: '',
  requestId: '',
  method: Methods.signMessage,
  isOffChain: false,
}

type ReturnType = [
  StateType,
  (
    message: string | EIP712TypedData,
    requestId: string,
    method: Methods.signMessage | Methods.signTypedMessage,
    isOffChain: boolean,
  ) => void,
  () => void,
]

const useSignMessageModal = (): ReturnType => {
  const [signMessageModalState, setSignMessageModalState] = useState<StateType>(INITIAL_MODAL_STATE)

  const openSignMessageModal = useCallback(
    (
      message: string | EIP712TypedData,
      requestId: string,
      method: Methods,
      isOffChain = INITIAL_MODAL_STATE.isOffChain,
    ) => {
      setSignMessageModalState({
        ...INITIAL_MODAL_STATE,
        isOpen: true,
        message,
        requestId,
        method,
        isOffChain,
      })
    },
    [],
  )

  const closeSignMessageModal = useCallback(() => {
    setSignMessageModalState(INITIAL_MODAL_STATE)
  }, [])

  return [signMessageModalState, openSignMessageModal, closeSignMessageModal]
}

export default useSignMessageModal
