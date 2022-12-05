import { useState, useCallback } from 'react'
import type { EIP712TypedData } from '@gnosis.pm/safe-apps-sdk'
import { Methods } from '@gnosis.pm/safe-apps-sdk'

type StateType = {
  isOpen: boolean
  message: string | EIP712TypedData
  requestId: string
  method: Methods
  offChain: boolean
}

const INITIAL_MODAL_STATE: StateType = {
  isOpen: false,
  message: '',
  requestId: '',
  method: Methods.signMessage,
  offChain: false,
}

type ReturnType = [
  StateType,
  (
    message: string | EIP712TypedData,
    requestId: string,
    method: Methods.signMessage | Methods.signTypedMessage,
    offChain: boolean,
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
      offChain = INITIAL_MODAL_STATE.offChain,
    ) => {
      setSignMessageModalState({
        ...INITIAL_MODAL_STATE,
        isOpen: true,
        message,
        requestId,
        method,
        offChain,
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
